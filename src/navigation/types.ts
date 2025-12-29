
export type Place = {
  openingHours: string;
  address: string;
  description: string;
  id: string;
  name: string;
  city: string;
  image: any;
  rating: number;
  favorite?: boolean;
  latitude: number;
  longitude: number;
  category: string;
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
  MyPosts: undefined;
  LikedPlaces: undefined;
};
