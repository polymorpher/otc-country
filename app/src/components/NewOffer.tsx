import React, { useCallback } from 'react';
import { Box, Text } from '@chakra-ui/react';
import ethers, { BigNumber } from "ethers"
import { useAccount, useContractRead } from 'wagmi';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { readContract } from '@wagmi/core'
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import { otcContract } from '~/helpers/contracts';
import { regexEtherAddress } from '~/helpers/regex';

interface NewOfferProps {
  domain: string;
}

const checkAssetAvailable = (asset: string) => readContract({
  ...otcContract,
  functionName: "assets",
  args: [asset]
}).then(res => !!res)

const schema = (commissionRate: number) => yup.object({
  domainOwner: yup.string().required().matches(regexEtherAddress),
  srcAsset: yup.string().required().test('available', 'not available', checkAssetAvailable),
  destAsset: yup.string().required().test('available', 'not available', checkAssetAvailable),
  depositAmount: yup.number().required().min(0),
  acceptAmount: yup.number().required().min(0),
  commissionRate: yup.number().required().min(commissionRate),
  lockWithdrawDuration: yup.number().required().min(0)
})

const NewOffer: React.FC<NewOfferProps> = ({ domain }) => {
  const { address, isConnected } = useAccount();

  const { data: commissionRateScale } = useContractRead({
    ...otcContract,
    functionName: 'commissionRateScale'
  })

  const { register, handleSubmit } = useForm({
    resolver: yupResolver(schema(BigNumber.from(commissionRateScale).toNumber()))
  })

  const { config } = usePrepareContractWrite({
    ...otcContract,
    functionName: "createOffer"
  })

  const { write: createOffer } = useContractWrite(config)

  const handleOfferSubmit = useCallback((data: Parameters<Parameters<typeof handleSubmit>[0]>[0]) => {
    if (!createOffer) {
      return
    }

    createOffer({
      args: [
        domain,
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(Math.random().toString())),
        data.domainOwner,
        data.srcAsset,
        data.destAsset,
        data.depositAmount,
        data.acceptAmount,
        data.commissionRate,
        data.lockWithdrawDuration
      ]
    })
  }, [createOffer])

  if (!isConnected) {
    return (
      <Box>
        <Text>Offer is available from the given domain. Please connect your wallet to proceed.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text>Please create a new offer with the following information.</Text>
      <form onSubmit={handleSubmit(handleOfferSubmit)}>
      </form>
    </Box>
  );
};

export default NewOffer;
