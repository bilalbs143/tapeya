import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const Home = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Tapeya</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen>
      <div style={{ padding: 16 }}>Welcome to Tapeya</div>
    </IonContent>
  </IonPage>
);

export default Home;
