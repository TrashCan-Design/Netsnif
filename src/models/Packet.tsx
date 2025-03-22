export interface Packet {
  id: string;
  number: number;
  source: string;
  destination: string;
  protocol: string;
  info: string;
  data: string;
  timestamp: number;
  rawData?: string;
}