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
  code: string;
  name: string;
}

interface Room {
  id: number;
  code: string;
  name: string;
  treatmentClassID: string;
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
  isNewlyAdmitted: boolean;
}

interface DailyPatientMealLog {
  id: number;
  dailyPatientMealID: number;
  roomTypeName: string;
  roomName: string;
  patientMRN: string;
  patientName: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
  date: Date;
}

interface FoodMaterial {
  id: number;
  name: string;
  unit: string;
  standardPerMeal: number;
}

interface Food {
  id: number;
  name: string;
  foodMaterialUsages: FoodMaterialUsage[];
}

interface FoodMaterialUsage {
  foodID: number;
  foodMaterialID: number;
  quantityUsed: number;
  foodMaterial: FoodMaterial;
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
