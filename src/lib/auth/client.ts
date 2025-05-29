'use client';
//import type { Admin } from '@/types/admin';
import type { User } from '@/types/user';
import type { Train } from '@/types/train';
import { redirect } from 'next/navigation';
import { auth, db} from '@/lib/firebase';
import {  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc,getDoc } from "firebase/firestore"; 


// function generateToken(): string {
//   const arr = new Uint8Array(12);
//   window.crypto.getRandomValues(arr);
//   return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
// }

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  name: {
  firstName: 'Sofia',
  lastName: 'Rivers',
  },
  email: 'sofia@devias.io',
} satisfies User;

// const admin = {
//   id: 'ADMN-000',
//   avatar: '/assets/avatar1.png',
//   firstName: 'Sofia',
//   lastName: 'Rivers',
//   email: 'sofia@devias.io',
// } satisfies Admin;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  user: User = {
    id: '',
    avatar: '',
    name : {
      firstName: '',
      lastName: '',
    },
    email: '',
    token: '',
  };

  train: Train = {
    trainName:'',
    fromCity:'',
    toCity:'',
    seatsAvailable:0,
    ticketPrices:{
      economy:0,
      business:0,
      firstClass:0,
    },
  };

  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    const { firstName, lastName, email, password } = params;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const docRef = doc(db, 'users', email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // User already exists, return an error
        return { error: 'User already exists' };
      }
      if (!userCredential) {
        return { error: "Couldn't create user"};
      }
      user.id = userCredential.user.uid;
      user.email = email;
      user.name.firstName = firstName;
      user.name.lastName = lastName;
      user.avatar = '/assets/avatar.png';
      const newuser = userCredential.user;
      const idTokenResult = await newuser.getIdTokenResult();
      const uid = newuser.uid;
      
      await setDoc(doc(db, 'users', email), {
        ...params,
        id: uid,
        token: idTokenResult.token,
      });
      redirect('/auth/sign-in');
      return {};
    } catch (e) {
      return {};
    }
  }
  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const newuser = userCredential.user;
      // Make API request

      if (!newuser) {
        return { error: 'Invalid credentials' };
        // throw new Error('Invalid credentials');
      }

      const token = await newuser.getIdToken();
      localStorage.setItem('custom-auth-token', token);

      return {};
    } catch (error) {
      if (error === 'auth/wrong-password') {
        return { error: 'Wrong password' };
      }
      return {  };
    }
  }

  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
    const { email } = params;

    try {
      await sendPasswordResetEmail(auth, email);
      return {};
    } catch (error) {
      return {  };
    }
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    await signOut(auth);
    localStorage.removeItem('custom-auth-token');
    // user = undefined;

    return {};
  }
   
  // signOut(auth).then(() => {
  //   // Sign-out successful.
  // }).catch((error) => {
  //   // An error happened.
  // });

  // async signOut(auth: firebase.auth.Auth): Promise<{ error?: string }> {
  //   try {
  //     // Remove the custom auth token from local storage
  //     localStorage.removeItem('custom-auth-token');
  
  //     // Sign out from Firebase auth
  //     await auth.signOut();
  
  //     // Sign-out successful
  //     return {};
  //   } catch (error) {
  //     // An error happened
  //     return { error: error.message };
  //   }
  // }

}

export const authClient = new AuthClient();
