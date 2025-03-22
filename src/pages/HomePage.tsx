import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  useIonViewWillEnter,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { usePackets } from '../context/PacketContext';
import './HomePage.css'; // Import the CSS file
import { startCapture, stopCapture, addPacketListener } from '../services/PacketCaptureService'; // Import packet capture functions

const HomePage: React.FC = () => {
  const { packets, clearPackets, isCapturing, setIsCapturing } = usePackets();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const handleStartCapture = async () => {
    try {
      setLoading(true);
      const result = await startCapture();
      console.log('Start capture result:', result);
      setIsCapturing(true);
    } catch (error) {
      console.error('Failed to start capture:', error);
      // Handle error (e.g., show an alert)
    } finally {
      setLoading(false);
    }
  };

  const handleStopCapture = async () => {
    try {
      setLoading(true);
      const result = await stopCapture();
      console.log('Stop capture result:', result);
      setIsCapturing(false);
    } catch (error) {
      console.error('Failed to stop capture:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleClearPackets = () => {
    clearPackets();
  };

  const navigateToPacketDetail = (packetId: string) => {
    history.push(`/packet/${packetId}`);
  };

  // Function to determine row color based on protocol or index
  const getRowColor = (index: number, protocol: string) => {
      if (protocol === 'TCP' || protocol === 'HTTP') {
          return 'var(--ion-color-success-shade)';  // Green
      } else if (protocol === 'UDP' || protocol === 'DNS') {
          return 'var(--ion-color-primary-shade)';    // Blue
      } else {
          return 'var(--ion-color-danger-shade)';   // Red
      }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>NetSniff</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton
          expand="full"
          onClick={isCapturing ? handleStopCapture : handleStartCapture}
          disabled={loading}
        >
          {isCapturing ? 'Stop Capture' : 'Start Capture'}
          {loading && <IonSpinner name="crescent" />}
        </IonButton>

        <IonButton
          expand="full"
          color="secondary"
          onClick={handleClearPackets}
          disabled={packets.length === 0}
        >
          Clear Packets
        </IonButton>

        <IonGrid className="packet-table">
          <IonRow className="packet-header">
            <IonCol size="1">Number</IonCol>
            <IonCol size="3">Source</IonCol>
            <IonCol size="3">Destination</IonCol>
            <IonCol size="2">Protocol</IonCol>
            <IonCol size="3">Info</IonCol>
          </IonRow>
          {packets.map((packet, index) => (
            <IonRow
              key={packet.id}
              className="packet-row"
              style={{ backgroundColor: getRowColor(index, packet.protocol) }}
              onClick={() => navigateToPacketDetail(packet.id)}
            >
              <IonCol size="1">{packet.number}</IonCol>
              <IonCol size="3">{packet.source}</IonCol>
              <IonCol size="3">{packet.destination}</IonCol>
              <IonCol size="2">{packet.protocol}</IonCol>
              <IonCol size="3">{packet.info}</IonCol>
            </IonRow>
          ))}
        </IonGrid>
        {packets.length === 0 && !isCapturing &&(
          <p className="empty-message">No packets captured yet. Start capturing to see network traffic.</p>
        )}
        {isCapturing && packets.length === 0 &&(
          <p className="empty-message">Capturing Packets... Please wait</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default HomePage;