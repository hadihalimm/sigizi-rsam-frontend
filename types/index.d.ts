interface ResponseData<T> {
  data: T;
  message: string;
}

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSession {
  userID: number;
  username: string;
  name: string;
  role: string;
}

interface MealType {
  id: number;
  code: string;
  name: string;
}

interface RoomType {
  id: number;
  name: string;
}

interface Room {
  id: number;
  roomNumber: string;
  treatmentClass: string;
  roomTypeID: number;
  roomType: RoomType;
}

interface Patient {
  id: number;
  medicalRecordNumber: string;
  name: string;
  dateOfBirth: string;
  allergies: Allergy[];
}

interface DailyPatientMeal {
  id: number;
  patientID: number;
  roomID: number;
  mealTypeID: number;
  date: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  patient: Patient;
  room: Room;
  mealType: MealType;
  diets: Diet[];
}

interface DailyPatientMealLog {
  id: number;
  dailyPatientMealID: number;
  roomID: number;
  roomNumber: string;
  patientMRN: string;
  patientName: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
  date: Date;
}

interface Food {
  id: number;
  name: string;
  unit: string;
  price_per_unit: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MealItem {
  id: number;
  mealTypeID: number;
  foodID: number;
  quantity: number;
  mealType: MealType;
  food: Food;
  createdAt: Date;
  updatedAt: Date;
}

interface Diet {
  id: number;
  code: string;
  name: string;
}

interface DietCombinationCount {
  dietCodes: string;
  count: number;
}

interface Allergy {
  id: number;
  code: string;
  name: string;
}

interface MealMatrixEntry {
  treatmentClass: string;
  mealType: string;
  mealCount: string;
}

interface MatrixRow {
  treatmentClass: string;
  [mealType: string]: number | string;
}
