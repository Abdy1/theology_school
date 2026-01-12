import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLearn from "./pages/CourseLearn";
import CourseQuiz from "./pages/CourseQuiz";
import MyCourses from "./pages/MyCourses";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import CourseManagement from "./pages/CourseManagement";
import CertificateView from "@/pages/CertificateView";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import AssignmentReview from "./pages/AssignmentReview";
import Library from "./pages/Library";
import BookDetail from "./pages/BookDetail";
import MyLibrary from "./pages/MyLibrary";
import BookReader from "./pages/BookReader";
import LibraryManagement from "./pages/LibraryManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/learn" element={<CourseLearn />} />
            <Route path="/courses/:courseId/modules/:moduleIndex/quiz" element={<CourseQuiz />} />
            <Route path="/assignment/:assignmentId/review" element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <AssignmentReview />
              </ProtectedRoute>
            } />
            
            <Route path="/contact" element={<Contact />} />
            
            {/* Library Routes - Public Access */}
            <Route path="/library" element={<Library />} />
            <Route path="/library/book/:bookId" element={<BookDetail />} />
            <Route path="/library/book/:bookId/read" element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <BookReader />
              </ProtectedRoute>
            } />
            <Route path="/my-library" element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <MyLibrary />
              </ProtectedRoute>
            } />
            
            {/* Role-based routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/library-management" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LibraryManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/instructor" element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/create-course" element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <CreateCourse />
              </ProtectedRoute>
            } />
            
            <Route path="/edit-course/:courseId" element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <EditCourse />
              </ProtectedRoute>
            } />
            
            <Route path="/course-management/:courseId" element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <CourseManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/certificate/:certificateId" element={<CertificateView />} />
            
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
