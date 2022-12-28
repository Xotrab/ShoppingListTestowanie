import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore,getFirestore, initializeFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from '@angular/fire/firestore';
import { provideStorage,getStorage, connectStorageEmulator } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebase)
      initializeFirestore(app, {experimentalForceLongPolling: true })
      return app;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();

      connectFirestoreEmulator(firestore, 'localhost', 8081);
      enableIndexedDbPersistence(firestore);
    
      return firestore;
    }),
    provideAuth(() => {
      const auth = getAuth();
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

      return auth;
    }),
    provideStorage(() => {
      const storage = getStorage();

      connectStorageEmulator(storage, 'localhost', 9199);
      return storage;
    }),
    BrowserAnimationsModule,
    MatToolbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
