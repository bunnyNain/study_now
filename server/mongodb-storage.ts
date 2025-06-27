import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import {
  type User,
  type InsertUser,
  type Student,
  type InsertStudent,
} from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { IStorage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const MONGODB_URI =
  "mongodb+srv://bansinain:NJm1HyJfQoWfIkPB@cluster0.t2wxft5.mongodb.net/studynow?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=false";

// MongoDB document interfaces with ObjectId
interface MongoUser {
  _id?: ObjectId;
  id: number; // Our custom numeric ID
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
}

interface MongoStudent {
  _id?: ObjectId;
  id: number; // Our custom numeric ID
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  status: string;
  studentId: string;
  enrollmentDate: Date;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;
  private usersCollection: Collection<MongoUser> | null = null;
  private studentsCollection: Collection<MongoStudent> | null = null;
  private countersCollection: Collection<any> | null = null;
  private isConnected: boolean = false;

  constructor() {
    console.log("Initializing MongoDB storage...");
    console.log(
      "MongoDB URI:",
      MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"),
    ); // Hide credentials in logs

    // Different configurations for local vs cloud MongoDB
    const isLocal =
      MONGODB_URI.includes("localhost") || MONGODB_URI.includes("127.0.0.1");
    const options = isLocal
      ? {
          // Local MongoDB options
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 5000,
        }
      : {
          // Atlas/Cloud MongoDB options
          connectTimeoutMS: 10000,
          socketTimeoutMS: 10000,
          serverSelectionTimeoutMS: 10000,
          maxPoolSize: 10,
          retryWrites: true,
          serverApi: {
            version: "1" as const,
            strict: true,
            deprecationErrors: true,
          },
        };

    this.client = new MongoClient(MONGODB_URI, options);
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      console.log("Attempting to connect to MongoDB...");

      // Set a timeout for the connection attempt
      const connectionPromise = this.client.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("MongoDB connection timeout")),
          15000,
        );
      });

      await Promise.race([connectionPromise, timeoutPromise]);
      console.log("MongoDB client connected");

      this.db = this.client.db("student_management");
      this.usersCollection = this.db.collection<MongoUser>("users");
      this.studentsCollection = this.db.collection<MongoStudent>("students");
      this.countersCollection = this.db.collection("counters");

      console.log("Database and collections initialized");

      // Test connection with a simple ping
      await this.db.admin().ping();
      console.log("MongoDB ping successful");

      // Create indexes
      await this.usersCollection.createIndex({ email: 1 }, { unique: true });
      await this.usersCollection.createIndex({ id: 1 }, { unique: true });
      await this.studentsCollection.createIndex({ email: 1 }, { unique: true });
      await this.studentsCollection.createIndex({ id: 1 }, { unique: true });
      await this.studentsCollection.createIndex(
        { studentId: 1 },
        { unique: true, sparse: true },
      );

      console.log("Database indexes created");

      // Initialize counters and default user
      await this.initializeCounters();
      await this.initializeDefaultUser();

      this.isConnected = true;
      console.log("Connected to MongoDB successfully");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      console.log(
        "MongoDB connection failed - all operations will return empty/error responses",
      );
      this.isConnected = false;
    }
  }

  private async initializeCounters(): Promise<void> {
    if (!this.countersCollection) return;

    try {
      // Initialize user counter
      await this.countersCollection.updateOne(
        { _id: "userId" },
        { $setOnInsert: { sequence: 1 } },
        { upsert: true },
      );

      // Initialize student counter
      await this.countersCollection.updateOne(
        { _id: "studentId" },
        { $setOnInsert: { sequence: 1 } },
        { upsert: true },
      );
    } catch (error) {
      console.error("Error initializing counters:", error);
    }
  }

  private async getNextId(counterName: string): Promise<number> {
    if (!this.countersCollection)
      throw new Error("Counters collection not initialized");

    const result = await this.countersCollection.findOneAndUpdate(
      { _id: counterName },
      { $inc: { sequence: 1 } },
      { returnDocument: "after", upsert: true },
    );

    return result.value?.sequence || 1;
  }

  private async initializeDefaultUser(): Promise<void> {
    if (!this.usersCollection) {
      console.log(
        "Users collection not available for admin user initialization",
      );
      return;
    }

    try {
      const existingAdmin = await this.usersCollection.findOne({
        email: "admin@university.edu",
      });
      if (!existingAdmin) {
        console.log("Creating default admin user...");
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const userId = await this.getNextId("userId");

        await this.usersCollection.insertOne({
          id: userId,
          email: "admin@university.edu",
          password: hashedPassword,
          name: "Admin User",
          role: "admin",
          createdAt: new Date(),
        });

        console.log("Default admin user created successfully");
      } else {
        console.log("Admin user already exists");
      }
    } catch (error) {
      console.error("Error initializing default user:", error);
    }
  }

  private generateStudentId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `STU${year}${random}`;
  }

  private mongoUserToUser(mongoUser: MongoUser): User {
    return {
      id: mongoUser.id,
      email: mongoUser.email,
      password: mongoUser.password,
      name: mongoUser.name,
      role: mongoUser.role,
    };
  }

  private mongoStudentToStudent(mongoStudent: MongoStudent): Student {
    return {
      id: mongoStudent.id,
      firstName: mongoStudent.firstName,
      lastName: mongoStudent.lastName,
      email: mongoStudent.email,
      course: mongoStudent.course,
      status: mongoStudent.status,
      studentId: mongoStudent.studentId,
      enrollmentDate: mongoStudent.enrollmentDate,
      phone: mongoStudent.phone,
      address: mongoStudent.address,
      notes: mongoStudent.notes,
      createdAt: mongoStudent.createdAt,
      updatedAt: mongoStudent.updatedAt,
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    if (!this.isConnected || !this.usersCollection) return undefined;

    try {
      const user = await this.usersCollection.findOne({ id: id });
      return user ? this.mongoUserToUser(user) : undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.isConnected || !this.usersCollection) return undefined;

    try {
      const user = await this.usersCollection.findOne({ email });
      return user ? this.mongoUserToUser(user) : undefined;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.isConnected || !this.usersCollection) {
      throw new Error("Database not connected");
    }

    try {
      const hashedPassword = await bcrypt.hash(insertUser.password, 10);
      const userId = await this.getNextId("userId");

      const mongoUser: MongoUser = {
        id: userId,
        email: insertUser.email,
        password: hashedPassword,
        name: insertUser.name,
        role: insertUser.role || "admin",
        createdAt: new Date(),
      };

      await this.usersCollection.insertOne(mongoUser);
      return this.mongoUserToUser(mongoUser);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async authenticateUser(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string } | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  }

  async getStudents(): Promise<Student[]> {
    if (!this.isConnected || !this.studentsCollection) return [];

    try {
      const students = await this.studentsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return students.map((student) => this.mongoStudentToStudent(student));
    } catch (error) {
      console.error("Error getting students:", error);
      return [];
    }
  }

  async getStudent(id: number): Promise<Student | undefined> {
    if (!this.isConnected || !this.studentsCollection) return undefined;

    try {
      const student = await this.studentsCollection.findOne({ id });
      return student ? this.mongoStudentToStudent(student) : undefined;
    } catch (error) {
      console.error("Error getting student:", error);
      return undefined;
    }
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    if (!this.isConnected || !this.studentsCollection) return undefined;

    try {
      const student = await this.studentsCollection.findOne({ email });
      return student ? this.mongoStudentToStudent(student) : undefined;
    } catch (error) {
      console.error("Error getting student by email:", error);
      return undefined;
    }
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    if (!this.isConnected || !this.studentsCollection) {
      throw new Error("Database not connected");
    }

    try {
      const now = new Date();
      const studentId = insertStudent.studentId || this.generateStudentId();
      const id = await this.getNextId("studentId");

      const mongoStudent: MongoStudent = {
        id,
        firstName: insertStudent.firstName,
        lastName: insertStudent.lastName,
        email: insertStudent.email,
        course: insertStudent.course,
        status: insertStudent.status || "active",
        studentId,
        enrollmentDate: insertStudent.enrollmentDate,
        phone: insertStudent.phone || null,
        address: insertStudent.address || null,
        notes: insertStudent.notes || null,
        createdAt: now,
        updatedAt: now,
      };

      await this.studentsCollection.insertOne(mongoStudent);
      return this.mongoStudentToStudent(mongoStudent);
    } catch (error) {
      console.error("Error creating student:", error);
      throw error;
    }
  }

  async updateStudent(
    id: number,
    updateData: Partial<InsertStudent>,
  ): Promise<Student | undefined> {
    if (!this.isConnected || !this.studentsCollection) return undefined;

    try {
      // Filter out undefined values and convert null to proper type
      const updateFields: Partial<MongoStudent> = {
        updatedAt: new Date(),
      };

      // Only include defined fields in the update
      if (updateData.firstName !== undefined)
        updateFields.firstName = updateData.firstName;
      if (updateData.lastName !== undefined)
        updateFields.lastName = updateData.lastName;
      if (updateData.email !== undefined) updateFields.email = updateData.email;
      if (updateData.course !== undefined)
        updateFields.course = updateData.course;
      if (updateData.status !== undefined)
        updateFields.status = updateData.status;
      if (updateData.enrollmentDate !== undefined)
        updateFields.enrollmentDate = updateData.enrollmentDate;
      if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
      if (updateData.address !== undefined)
        updateFields.address = updateData.address;
      if (updateData.notes !== undefined) updateFields.notes = updateData.notes;
      if (updateData.studentId !== undefined)
        updateFields.studentId =
          updateData.studentId || this.generateStudentId();

      const result = await this.studentsCollection.findOneAndUpdate(
        { id: id },
        { $set: updateFields },
        { returnDocument: "after" },
      );

      return result ? this.mongoStudentToStudent(result) : undefined;
    } catch (error) {
      console.error("Error updating student:", error);
      return undefined;
    }
  }

  async deleteStudent(id: number): Promise<boolean> {
    if (!this.isConnected || !this.studentsCollection) return false;

    try {
      const result = await this.studentsCollection.deleteOne({ id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting student:", error);
      return false;
    }
  }
}
