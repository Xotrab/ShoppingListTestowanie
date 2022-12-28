import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, enableIndexedDbPersistence, getFirestore, initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent
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
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
