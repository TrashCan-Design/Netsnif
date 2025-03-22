import React, { createContext, useContext, useState, useEffect } from 'react';
import { Packet } from '../models/Packet'; // Import the Packet interface
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs

interface PacketContextType {
  packets: Packet[];
  addPacket: (packet: Packet) => void;
  clearPackets: () => void;
  isCapturing: boolean;
  setIsCapturing: (value: boolean) => void;
}

const PacketContext = createContext<PacketContextType | undefined>(undefined);

export const PacketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const addPacket = (packet: Packet) => {
    setPackets(prevPackets => {
      const newPacket = {
        ...packet,
        id: uuidv4(),
        number: prevPackets.length + 1,
      };
      return [...prevPackets, newPacket];
    });
  };

  const clearPackets = () => {
    setPackets([]);
  };

    // Simulate packet capture when isCapturing is true
    useEffect(() => {
      if (!isCapturing) return;

      const interval = setInterval(() => {
          const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'];
          const randomProtocol = protocols[Math.floor(Math.random() * protocols.length)];

          addPacket({
              id: '',
              number: 0,
              source: `192.168.1.${Math.floor(Math.random() * 255)}`,
              destination: `172.217.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              protocol: randomProtocol,
              info: `${randomProtocol} packet data`,
              data: `Sample packet data for ${randomProtocol}`,
              timestamp: Date.now(),
          });
      }, 2000);

      return () => clearInterval(interval);
  }, [isCapturing]);

  return (
    <PacketContext.Provider value={{ packets, addPacket, clearPackets, isCapturing, setIsCapturing }}>
      {children}
    </PacketContext.Provider>
  );
};

export const usePackets = () => {
  const context = useContext(PacketContext);
  if (!context) {
    throw new Error('usePackets must be used within a PacketProvider');
  }
  return context;
};
