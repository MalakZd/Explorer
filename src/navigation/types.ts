import { ImageSourcePropType } from 'react-native';

export type Place = {
  image: ImageSourcePropType;
  name: string;
  city: string;
  rating: number;
  favorite: boolean;
};

export type RootStackParamList = {
  Main: undefined;
  PlaceDetails: { place: Place };
  AddSpot: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Splash: undefined;
  AccountCreated: undefined;
};
