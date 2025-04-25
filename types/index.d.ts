interface ResponseData<T> {
  data: T;
  message: string;
}
interface MealType {
  id: number;
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
}

interface DailyPatientMeal {
  id: number;
  patientID: number;
  roomID: number;
  mealTypeID: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  room: Room;
  mealType: MealType;
}
