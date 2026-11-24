export const FITCORE_IMAGES = {
  heroAthlete: '/src/assets/images/hero_male_athlete_1795517134497.jpg',
  facilityStrength: '/src/assets/images/facility_strength_zone_1795517135335.jpg',
  facilityCardio: '/src/assets/images/facility_cardio_zone_1795517135145.jpg',
  classTraining: '/src/assets/images/class_male_training_1795517136895.jpg',
  shopWhey: '/src/assets/images/shop_supplement_whey_1795517136764.jpg',
  trainerCoach: '/src/assets/images/trainer_male_coach_1795517137745.jpg',
} as const;

export const IMAGE_PRESETS = [
  { label: 'Male Athlete Dumbbell Workout', url: FITCORE_IMAGES.heroAthlete },
  { label: 'Strength Training Floor & Racks', url: FITCORE_IMAGES.facilityStrength },
  { label: 'Cardio & Turf Conditioning Zone', url: FITCORE_IMAGES.facilityCardio },
  { label: 'Male Athlete Functional Barbell Training', url: FITCORE_IMAGES.classTraining },
  { label: 'Whey Protein & Shaker Product Shot', url: FITCORE_IMAGES.shopWhey },
  { label: 'Male Head Coach Portrait', url: FITCORE_IMAGES.trainerCoach },
];
