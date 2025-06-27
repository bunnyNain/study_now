import { type User, type InsertUser, type Student, type InsertStudent } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null>;
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
}

import { MongoStorage } from './mongodb-storage';

// Using MongoDB Atlas exclusively - in-memory storage removed
console.log('Using MongoDB Atlas storage - cloud database persistence enabled');
export const storage = new MongoStorage();