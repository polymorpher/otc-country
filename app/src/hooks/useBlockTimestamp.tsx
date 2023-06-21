import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';

const useBlockTimestamp = () => {
  const [timestamp, setTimestamp] = useState<number>(0);

  const client = usePublicClient();

  useEffect(() => {
    client.getBlock().then((block) => setTimestamp(Number(block.timestamp)));

    const timer = setInterval(() => setTimestamp((prev) => prev + 1), 1000);

    return () => clearInterval(timer);
  }, [client]);

  return timestamp;
};

export default useBlockTimestamp;
