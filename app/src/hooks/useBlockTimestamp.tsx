import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';

const useBlockTimestamp = (): number | undefined => {
  const [timestamp, setTimestamp] = useState<number>();

  const client = usePublicClient();

  useEffect(() => {
    client.getBlock().then((block) => setTimestamp(Number(block.timestamp)));

    const timer = setInterval(() => setTimestamp((prev) => (prev !== undefined ? prev + 1 : undefined)), 1000);

    return () => clearInterval(timer);
  }, [client]);

  return timestamp;
};

export default useBlockTimestamp;
