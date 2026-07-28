// ============================================================
// 1. قاعدة البيانات (LocalStorage)
// ============================================================
const DB = {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    genId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
};

// ============================================================
// 2. مسح البيانات القديمة وإعادة التهيئة
// ============================================================
function resetAndSeed() {
    // مسح كل البيانات
    localStorage.clear();
    console.log('🗑️ LocalStorage cleared');

    // إنشاء المستخدمين
    const users = [
        {
            id: DB.genId(),
            name: 'Dr. Ahmed Mansour',
            email: 'admin@edumanage.com',
            password: 'password',
            role: 'super-admin',
            avatar: 'https://ui-avatars.com/api/?name=Ahmed+Mansour&background=004ac6&color=fff&size=128',
            emailVerified: true,
            createdAt: new Date().toISOString()
        },
        {
            id: DB.genId(),
            name: 'Dr. Sarah Wilson',
            email: 'school@edumanage.com',
            password: 'password',
            role: 'school-admin',
            schoolId: 'school_123',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=006242&color=fff&size=128',
            emailVerified: true,
            createdAt: new Date().toISOString()
        },
        {
            id: DB.genId(),
            name: 'Prof. John Smith',
            email: 'teacher@edumanage.com',
            password: 'password',
            role: 'teacher',
            schoolId: 'school_123',
            subject: 'Mathematics',
            avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=38485d&color=fff&size=128',
            emailVerified: true,
            createdAt: new Date().toISOString()
        },
        {
            id: DB.genId(),
            name: 'Ahmed Mohamed',
            email: 'student@edumanage.com',
            password: 'password',
            role: 'student',
            schoolId: 'school_123',
            enrolledCourses: [],
            avatar: 'https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=2563eb&color=fff&size=128',
            emailVerified: true,
            createdAt: new Date().toISOString()
        }
    ];

    // مدرسة
    const schools = [
        {
            id: 'school_123',
            name: 'International School of Cairo',
            location: 'Cairo, Egypt',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];

    // حفظ البيانات
    DB.set('users', users);
    DB.set('schools', schools);
    DB.set('courses', []);
    DB.set('lessons', []);
    DB.set('assignments', []);
    DB.set('quizzes', []);
    DB.set('chats', []);
    DB.set('notifications', []);
    DB.set('submissions', []);
    DB.set('quizSubmissions', []);
    DB.set('attendance', []);
    DB.set('grades', []);
    DB.set('certifications', []);
    DB.set('discussions', []);
    DB.set('discussionComments', []);
    DB.set('lessonProgress', []);

    console.log('✅ Data seeded successfully!');
    console.log('📊 Users:', users.map(u => u.role + ': ' + u.email));
    return users;
}

// ============================================================
// 3. Auth - المصادقة
// ============================================================
const Auth = {
    currentUser: null,

    login(email, password) {
        const users = DB.get('users');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'Account not found. Please sign up first.' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Invalid password. Please try again.' };
        }

        if (user.role !== 'super-admin' && !user.emailVerified) {
            return { success: false, message: 'Please verify your email first.' };
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user: user };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = '../login.html';
    },

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                try {
                    this.currentUser = JSON.parse(stored);
                } catch {
                    this.currentUser = null;
                }
            }
        }
        return this.currentUser;
    },

    updateProfile(updates) {
        if (!this.currentUser) return null;
        const users = DB.get('users');
        const index = users.findIndex(u => u.id === this.currentUser.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            DB.set('users', users);
            this.currentUser = users[index];
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return this.currentUser;
        }
        return null;
    },

    changePassword(oldPassword, newPassword) {
        if (!this.currentUser) return false;
        const users = DB.get('users');
        const index = users.findIndex(u => u.id === this.currentUser.id);
        if (index !== -1 && users[index].password === oldPassword) {
            users[index].password = newPassword;
            DB.set('users', users);
            this.currentUser = users[index];
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    },

    resetPassword(email, newPassword) {
        const users = DB.get('users');
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index].password = newPassword;
            DB.set('users', users);
            return true;
        }
        return false;
    },

    getUsersByRole(role) {
        if (role === 'all') return DB.get('users');
        return DB.get('users').filter(u => u.role === role);
    },

    getUsersBySchool(schoolId) {
        return DB.get('users').filter(u => u.schoolId === schoolId);
    },

    addUser(userData) {
        const users = DB.get('users');
        const newUser = {
            id: DB.genId(),
            ...userData,
            enrolledCourses: [],
            emailVerified: false,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        DB.set('users', users);
        return newUser;
    },

    deleteUser(userId) {
        let users = DB.get('users');
        users = users.filter(u => u.id !== userId);
        DB.set('users', users);
    },

    getUserById(id) {
        return DB.get('users').find(u => u.id === id);
    },

    getUserByEmail(email) {
        return DB.get('users').find(u => u.email === email);
    },

    verifyEmail(email) {
        const users = DB.get('users');
        const user = users.find(u => u.email === email);
        if (user) {
            user.emailVerified = true;
            DB.set('users', users);
            return true;
        }
        return false;
    },

    checkEmailExists(email) {
        return DB.get('users').some(u => u.email === email);
    },

    getRedirectPath(role) {
        const map = {
            'super-admin': 'super-admin/index.html',
            'school-admin': 'school-admin/index.html',
            'teacher': 'teacher/index.html',
            'student': 'student/index.html'
        };
        return map[role] || 'index.html';
    }
};

// ============================================================
// 4. Schools API
// ============================================================
const SchoolAPI = {
    getAll() { return DB.get('schools'); },
    getById(id) { return DB.get('schools').find(s => s.id === id); },
    add(data) {
        const schools = DB.get('schools');
        const newSchool = { id: DB.genId(), ...data, createdAt: new Date().toISOString() };
        schools.push(newSchool);
        DB.set('schools', schools);
        return newSchool;
    },
    update(id, updates) {
        const schools = DB.get('schools');
        const index = schools.findIndex(s => s.id === id);
        if (index !== -1) {
            schools[index] = { ...schools[index], ...updates };
            DB.set('schools', schools);
            return schools[index];
        }
        return null;
    },
    delete(id) {
        let schools = DB.get('schools');
        schools = schools.filter(s => s.id !== id);
        DB.set('schools', schools);
    }
};

// ============================================================
// 5. Courses API
// ============================================================
const CourseAPI = {
    getAll() { return DB.get('courses'); },
    getByTeacher(teacherId) { return DB.get('courses').filter(c => c.teacherId === teacherId); },
    getBySchool(schoolId) { return DB.get('courses').filter(c => c.schoolId === schoolId); },
    getById(id) { return DB.get('courses').find(c => c.id === id); },
    add(data) {
        const courses = DB.get('courses');
        const newCourse = { id: DB.genId(), ...data, createdAt: new Date().toISOString() };
        courses.push(newCourse);
        DB.set('courses', courses);
        return newCourse;
    },
    update(id, updates) {
        const courses = DB.get('courses');
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...updates };
            DB.set('courses', courses);
            return courses[index];
        }
        return null;
    },
    delete(id) {
        let courses = DB.get('courses');
        courses = courses.filter(c => c.id !== id);
        DB.set('courses', courses);
    }
};

// ============================================================
// 6. Lessons API
// ============================================================
const LessonAPI = {
    getAll() { return DB.get('lessons'); },
    getByCourse(courseId) { return DB.get('lessons').filter(l => l.courseId === courseId); },
    getById(id) { return DB.get('lessons').find(l => l.id === id); },
    add(data) {
        const lessons = DB.get('lessons');
        const newLesson = { id: DB.genId(), ...data, createdAt: new Date().toISOString() };
        lessons.push(newLesson);
        DB.set('lessons', lessons);
        return newLesson;
    },
    update(id, updates) {
        const lessons = DB.get('lessons');
        const index = lessons.findIndex(l => l.id === id);
        if (index !== -1) {
            lessons[index] = { ...lessons[index], ...updates };
            DB.set('lessons', lessons);
            return lessons[index];
        }
        return null;
    },
    delete(id) {
        let lessons = DB.get('lessons');
        lessons = lessons.filter(l => l.id !== id);
        DB.set('lessons', lessons);
    }
};

// ============================================================
// 7. Assignments API
// ============================================================
const AssignmentAPI = {
    getAll() { return DB.get('assignments'); },
    getByCourse(courseId) { return DB.get('assignments').filter(a => a.courseId === courseId); },
    getById(id) { return DB.get('assignments').find(a => a.id === id); },
    add(data) {
        const assignments = DB.get('assignments');
        const newAssignment = { id: DB.genId(), ...data, status: 'active', createdAt: new Date().toISOString() };
        assignments.push(newAssignment);
        DB.set('assignments', assignments);
        return newAssignment;
    },
    update(id, updates) {
        const assignments = DB.get('assignments');
        const index = assignments.findIndex(a => a.id === id);
        if (index !== -1) {
            assignments[index] = { ...assignments[index], ...updates };
            DB.set('assignments', assignments);
            return assignments[index];
        }
        return null;
    },
    delete(id) {
        let assignments = DB.get('assignments');
        assignments = assignments.filter(a => a.id !== id);
        DB.set('assignments', assignments);
    },
    submit(studentId, assignmentId, fileData) {
        const submissions = DB.get('submissions');
        const newSubmission = {
            id: DB.genId(),
            studentId,
            assignmentId,
            fileData,
            marks: null,
            feedback: '',
            status: 'submitted',
            timestamp: new Date().toISOString()
        };
        submissions.push(newSubmission);
        DB.set('submissions', submissions);
        return newSubmission;
    },
    grade(submissionId, marks, feedback) {
        const submissions = DB.get('submissions');
        const index = submissions.findIndex(s => s.id === submissionId);
        if (index !== -1) {
            submissions[index].marks = marks;
            submissions[index].feedback = feedback;
            submissions[index].status = 'graded';
            DB.set('submissions', submissions);
            return submissions[index];
        }
        return null;
    },
    getSubmissionsByAssignment(assignmentId) {
        return DB.get('submissions').filter(s => s.assignmentId === assignmentId);
    },
    getSubmissionsByStudent(studentId) {
        return DB.get('submissions').filter(s => s.studentId === studentId);
    }
};

// ============================================================
// 8. Quizzes API
// ============================================================
const QuizAPI = {
    getAll() { return DB.get('quizzes'); },
    getByCourse(courseId) { return DB.get('quizzes').filter(q => q.courseId === courseId); },
    getById(id) { return DB.get('quizzes').find(q => q.id === id); },
    add(data) {
        const quizzes = DB.get('quizzes');
        const newQuiz = { id: DB.genId(), ...data, status: 'published', createdAt: new Date().toISOString() };
        quizzes.push(newQuiz);
        DB.set('quizzes', quizzes);
        return newQuiz;
    },
    update(id, updates) {
        const quizzes = DB.get('quizzes');
        const index = quizzes.findIndex(q => q.id === id);
        if (index !== -1) {
            quizzes[index] = { ...quizzes[index], ...updates };
            DB.set('quizzes', quizzes);
            return quizzes[index];
        }
        return null;
    },
    delete(id) {
        let quizzes = DB.get('quizzes');
        quizzes = quizzes.filter(q => q.id !== id);
        DB.set('quizzes', quizzes);
    },
    submit(studentId, quizId, answers) {
        const submissions = DB.get('quizSubmissions');
        const newSubmission = {
            id: DB.genId(),
            studentId,
            quizId,
            answers,
            score: 0,
            status: 'submitted',
            timestamp: new Date().toISOString()
        };
        submissions.push(newSubmission);
        DB.set('quizSubmissions', submissions);
        return newSubmission;
    },
    getSubmissionsByQuiz(quizId) {
        return DB.get('quizSubmissions').filter(s => s.quizId === quizId);
    },
    getSubmissionsByStudent(studentId) {
        return DB.get('quizSubmissions').filter(s => s.studentId === studentId);
    },
    autoGrade(quizSubmissionId) {
        const submissions = DB.get('quizSubmissions');
        const index = submissions.findIndex(s => s.id === quizSubmissionId);
        if (index === -1) return null;

        const submission = submissions[index];
        const quiz = this.getById(submission.quizId);
        if (!quiz) return null;

        const userAnswers = submission.answers ? submission.answers.split(',') : [];
        const correctAnswers = quiz.answers ? quiz.answers.split(',') : [];

        let score = 0;
        const totalQuestions = Math.max(userAnswers.length, correctAnswers.length);

        for (let i = 0; i < Math.min(userAnswers.length, correctAnswers.length); i++) {
            if (userAnswers[i] && correctAnswers[i] &&
                userAnswers[i].trim().toLowerCase() === correctAnswers[i].trim().toLowerCase()) {
                score++;
            }
        }

        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        submission.score = percentage;
        submission.status = 'graded';
        DB.set('quizSubmissions', submissions);
        return submission;
    }
};

// ============================================================
// 9. Notifications API
// ============================================================
const NotificationAPI = {
    getAll() { return DB.get('notifications'); },
    getByUser(userId) {
        return DB.get('notifications')
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    add(userId, title, message, type = 'info') {
        const notifications = DB.get('notifications');
        const newNotification = {
            id: DB.genId(),
            userId,
            title,
            message,
            type,
            read: false,
            timestamp: new Date().toISOString()
        };
        notifications.push(newNotification);
        DB.set('notifications', notifications);
        return newNotification;
    },
    markAsRead(notificationId) {
        const notifications = DB.get('notifications');
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notifications[index].read = true;
            DB.set('notifications', notifications);
            return notifications[index];
        }
        return null;
    },
    markAllAsRead(userId) {
        const notifications = DB.get('notifications');
        notifications.forEach(n => { if (n.userId === userId) n.read = true; });
        DB.set('notifications', notifications);
    },
    delete(notificationId) {
        let notifications = DB.get('notifications');
        notifications = notifications.filter(n => n.id !== notificationId);
        DB.set('notifications', notifications);
    },
    clearAll(userId) {
        let notifications = DB.get('notifications');
        notifications = notifications.filter(n => n.userId !== userId);
        DB.set('notifications', notifications);
    },
    getUnreadCount(userId) {
        return DB.get('notifications').filter(n => n.userId === userId && !n.read).length;
    }
};

// ============================================================
// 10. Chat API
// ============================================================
const ChatAPI = {
    getAll() { return DB.get('chats'); },
    getConversation(user1Id, user2Id) {
        return DB.get('chats')
            .filter(c => (c.senderId === user1Id && c.receiverId === user2Id) ||
                (c.senderId === user2Id && c.receiverId === user1Id))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },
    sendMessage(senderId, receiverId, message) {
        const chats = DB.get('chats');
        const newMessage = {
            id: DB.genId(),
            senderId,
            receiverId,
            message,
            read: false,
            timestamp: new Date().toISOString()
        };
        chats.push(newMessage);
        DB.set('chats', chats);
        return newMessage;
    },
    markAsRead(messageId) {
        const chats = DB.get('chats');
        const index = chats.findIndex(c => c.id === messageId);
        if (index !== -1) {
            chats[index].read = true;
            DB.set('chats', chats);
            return chats[index];
        }
        return null;
    },
    getUnreadCount(userId) {
        return DB.get('chats').filter(c => c.receiverId === userId && !c.read).length;
    },
    getAllContacts(userId) {
        const chats = DB.get('chats');
        const contactIds = new Set();
        chats.forEach(c => {
            if (c.senderId === userId) contactIds.add(c.receiverId);
            if (c.receiverId === userId) contactIds.add(c.senderId);
        });
        const contacts = [];
        contactIds.forEach(id => {
            if (id !== 'public') {
                const user = Auth.getUserById(id);
                if (user) contacts.push(user);
            }
        });
        return contacts;
    },
    sendPublic(senderId, message) {
        const chats = DB.get('chats');
        const newMessage = {
            id: DB.genId(),
            senderId,
            receiverId: 'public',
            message,
            read: true,
            timestamp: new Date().toISOString()
        };
        chats.push(newMessage);
        DB.set('chats', chats);
        return newMessage;
    },
    getPublicMessages() {
        return DB.get('chats').filter(c => c.receiverId === 'public')
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
};

// ============================================================
// 11. Attendance API
// ============================================================
const AttendanceAPI = {
    getAll() { return DB.get('attendance'); },
    getByStudent(studentId) { return DB.get('attendance').filter(a => a.studentId === studentId); },
    getByCourse(courseId) { return DB.get('attendance').filter(a => a.courseId === courseId); },
    mark(studentId, courseId, status, date) {
        const attendance = DB.get('attendance');
        const existing = attendance.find(a =>
            a.studentId === studentId &&
            a.courseId === courseId &&
            a.date === (date || new Date().toISOString().split('T')[0])
        );
        if (existing) {
            existing.status = status;
            DB.set('attendance', attendance);
            return existing;
        }

        const record = {
            id: DB.genId(),
            studentId,
            courseId,
            status,
            date: date || new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };
        attendance.push(record);
        DB.set('attendance', attendance);
        return record;
    },
    getStats(studentId) {
        const records = this.getByStudent(studentId);
        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const excused = records.filter(r => r.status === 'excused').length;
        return {
            total,
            present,
            absent,
            excused,
            percentage: total > 0 ? Math.round((present / total) * 100) : 0
        };
    }
};

// ============================================================
// 12. Grades API
// ============================================================
const GradeAPI = {
    getAll() { return DB.get('grades'); },
    getByStudent(studentId) { return DB.get('grades').filter(g => g.studentId === studentId); },
    getByCourse(courseId) { return DB.get('grades').filter(g => g.courseId === courseId); },
    add(gradeData) {
        const grades = DB.get('grades');
        const newGrade = {
            id: DB.genId(),
            ...gradeData,
            createdAt: new Date().toISOString()
        };
        grades.push(newGrade);
        DB.set('grades', grades);
        return newGrade;
    },
    getGPA(studentId) {
        const grades = this.getByStudent(studentId);
        if (grades.length === 0) return 0;
        const totalPoints = grades.reduce((sum, g) => {
            const p = g.grade;
            if (p >= 90) return sum + 4.0;
            if (p >= 80) return sum + 3.0;
            if (p >= 70) return sum + 2.0;
            if (p >= 60) return sum + 1.0;
            return sum + 0.0;
        }, 0);
        return Math.round((totalPoints / grades.length) * 100) / 100;
    }
};

// ============================================================
// 13. Enrollment API
// ============================================================
const EnrollmentAPI = {
    enrollStudent(studentId, courseId) {
        const users = DB.get('users');
        const user = users.find(u => u.id === studentId);
        if (!user) return false;
        if (user.role !== 'student') return false;
        if (!user.enrolledCourses) user.enrolledCourses = [];
        if (user.enrolledCourses.includes(courseId)) return false;

        user.enrolledCourses.push(courseId);
        DB.set('users', users);
        return true;
    },

    unenrollStudent(studentId, courseId) {
        const users = DB.get('users');
        const user = users.find(u => u.id === studentId);
        if (!user || !user.enrolledCourses) return false;

        const index = user.enrolledCourses.indexOf(courseId);
        if (index === -1) return false;

        user.enrolledCourses.splice(index, 1);
        DB.set('users', users);
        return true;
    },

    getStudentCourses(studentId) {
        const user = Auth.getUserById(studentId);
        if (!user || !user.enrolledCourses) return [];

        const courses = [];
        user.enrolledCourses.forEach(courseId => {
            const course = CourseAPI.getById(courseId);
            if (course) courses.push(course);
        });
        return courses;
    },

    getCourseStudents(courseId) {
        const users = DB.get('users');
        return users.filter(u =>
            u.role === 'student' &&
            u.enrolledCourses &&
            u.enrolledCourses.includes(courseId)
        );
    },

    isEnrolled(studentId, courseId) {
        const user = Auth.getUserById(studentId);
        if (!user || !user.enrolledCourses) return false;
        return user.enrolledCourses.includes(courseId);
    }
};

// ============================================================
// 14. Progress API
// ============================================================
const ProgressAPI = {
    getStudentCourseProgress(studentId, courseId) {
        const lessons = LessonAPI.getByCourse(courseId);
        const totalLessons = lessons.length;

        const assignments = AssignmentAPI.getByCourse(courseId);
        const submissions = AssignmentAPI.getSubmissionsByStudent(studentId);
        const completedAssignments = submissions.filter(s =>
            assignments.some(a => a.id === s.assignmentId) && s.status === 'graded'
        ).length;

        const quizzes = QuizAPI.getByCourse(courseId);
        const quizSubmissions = QuizAPI.getSubmissionsByStudent(studentId);
        const completedQuizzes = quizSubmissions.filter(s =>
            quizzes.some(q => q.id === s.quizId) && s.status === 'graded'
        ).length;

        const totalItems = totalLessons + assignments.length + quizzes.length;
        const completedItems = completedAssignments + completedQuizzes;

        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const grades = GradeAPI.getByStudent(studentId);
        const courseGrades = grades.filter(g => g.courseId === courseId);
        const avgGrade = courseGrades.length > 0 ?
            Math.round(courseGrades.reduce((sum, g) => sum + g.grade, 0) / courseGrades.length) : 0;

        return {
            studentId,
            courseId,
            totalLessons,
            viewedLessons: 0,
            completedAssignments,
            completedQuizzes,
            progress: Math.min(100, progress),
            avgGrade,
            status: progress >= 70 ? 'On Track' : progress >= 40 ? 'At Risk' : 'Needs Attention'
        };
    },

    getStudentAllProgress(studentId) {
        const courses = EnrollmentAPI.getStudentCourses(studentId);
        return courses.map(c => this.getStudentCourseProgress(studentId, c.id));
    }
};

// ============================================================
// 15. Certification API
// ============================================================
const CertificationAPI = {
    addCertification(studentId, courseId, certificateData) {
        const certifications = DB.get('certifications') || [];
        const newCert = {
            id: DB.genId(),
            studentId,
            courseId,
            title: certificateData.title || 'Course Completion',
            issueDate: new Date().toISOString(),
            expiryDate: certificateData.expiryDate || null,
            grade: certificateData.grade || null,
            certificateUrl: certificateData.certificateUrl || null,
            status: 'active'
        };
        certifications.push(newCert);
        DB.set('certifications', certifications);
        return newCert;
    },

    getStudentCertifications(studentId) {
        const certifications = DB.get('certifications') || [];
        return certifications.filter(c => c.studentId === studentId);
    },

    getById(id) {
        const certifications = DB.get('certifications') || [];
        return certifications.find(c => c.id === id);
    }
};

// ============================================================
// 16. Discussion API
// ============================================================
const DiscussionAPI = {
    createDiscussion(data) {
        const discussions = DB.get('discussions') || [];
        const newDiscussion = {
            id: DB.genId(),
            title: data.title,
            content: data.content,
            authorId: data.authorId,
            courseId: data.courseId || null,
            tags: data.tags || [],
            pinned: false,
            locked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        discussions.push(newDiscussion);
        DB.set('discussions', discussions);
        return newDiscussion;
    },

    getAll() { return DB.get('discussions') || []; },

    getByCourse(courseId) {
        const discussions = DB.get('discussions') || [];
        return discussions.filter(d => d.courseId === courseId);
    },

    addComment(discussionId, authorId, content) {
        const comments = DB.get('discussionComments') || [];
        const newComment = {
            id: DB.genId(),
            discussionId,
            authorId,
            content,
            createdAt: new Date().toISOString()
        };
        comments.push(newComment);
        DB.set('discussionComments', comments);
        return newComment;
    },

    getComments(discussionId) {
        const comments = DB.get('discussionComments') || [];
        return comments.filter(c => c.discussionId === discussionId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },

    getById(id) {
        const discussions = DB.get('discussions') || [];
        return discussions.find(d => d.id === id);
    }
};

// ============================================================
// 17. UI Helpers
// ============================================================
const UI = {
    showToast(title, message, type = 'success') {
        const oldToast = document.getElementById('notificationToast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.id = 'notificationToast';
        toast.className = 'fixed bottom-6 right-6 z-50 bg-[#111c2d] text-white rounded-xl p-4 shadow-2xl max-w-sm transform translate-y-0 opacity-100 transition-all duration-500';

        const iconMap = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info',
            message: 'chat'
        };

        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-[#6ffbbe]">${iconMap[type] || 'info'}</span>
                <div>
                    <p class="text-[14px] font-[400] leading-[20px] font-bold">${title}</p>
                    <p class="text-[12px] font-[500] leading-[16px] tracking-[0.05em] text-[#b7c8e1]">${message}</p>
                </div>
                <button class="text-[#b7c8e1] hover:text-white transition-colors" onclick="this.parentElement.parentElement.remove()">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.transform = 'translateY(100px)';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 500);
            }
        }, 4000);
    },

    loadUserProfile() {
        const user = Auth.getCurrentUser();
        if (!user) return;
        document.querySelectorAll('.profile-name').forEach(el => el.textContent = user.name);
        document.querySelectorAll('.profile-avatar').forEach(el => el.src = user.avatar || 'https://ui-avatars.com/api/?name=User&background=004ac6&color=fff&size=128');
        document.querySelectorAll('.profile-role').forEach(el => {
            const map = { 'super-admin': 'Super Admin', 'school-admin': 'School Admin', 'teacher': 'Teacher', 'student': 'Student' };
            el.textContent = map[user.role] || user.role;
        });
        this.updateNotificationBadge();
        this.updateChatBadge();
    },

    updateNotificationBadge() {
        const user = Auth.getCurrentUser();
        if (!user) return;
        const count = NotificationAPI.getUnreadCount(user.id);
        document.querySelectorAll('.notification-badge').forEach(badge => {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    },

    updateChatBadge() {
        const user = Auth.getCurrentUser();
        if (!user) return;
        const count = ChatAPI.getUnreadCount(user.id);
        document.querySelectorAll('.chat-badge').forEach(badge => {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    },

    updateAllBadges() {
        this.updateNotificationBadge();
        this.updateChatBadge();
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    },

    timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
        for (const [unit, value] of Object.entries(intervals)) {
            const count = Math.floor(seconds / value);
            if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
        }
        return 'Just now';
    }
};

// ============================================================
// 18. Permissions
// ============================================================
const Permissions = {
    check(requiredRole) {
        const user = Auth.getCurrentUser();
        if (!user) {
            window.location.href = '../login.html';
            return false;
        }
        const roles = {
            'super-admin': ['super-admin'],
            'school-admin': ['super-admin', 'school-admin'],
            'teacher': ['super-admin', 'school-admin', 'teacher'],
            'student': ['super-admin', 'school-admin', 'teacher', 'student']
        };
        if (roles[requiredRole] && roles[requiredRole].includes(user.role)) return true;
        UI.showToast('Access Denied', 'You do not have permission.', 'error');
        setTimeout(() => window.location.href = '../login.html', 2000);
        return false;
    }
};

// ============================================================
// 19. Sidebar Manager
// ============================================================
const SidebarManager = {
    getLinks(role) {
        const commonLinks = [
            { icon: 'dashboard', label: 'Dashboard', href: 'index.html' }
        ];

        const roleLinks = {
            'super-admin': [
                ...commonLinks,
                { icon: 'school', label: 'Schools', href: 'schools.html' },
                { icon: 'admin_panel_settings', label: 'Admins', href: 'admins.html' },
                { icon: 'analytics', label: 'Analytics', href: 'analytics.html' },
                { icon: 'assessment', label: 'Reports', href: 'reports.html' },
                { icon: 'subscriptions', label: 'Subscriptions', href: 'subscription.html' },
                { icon: 'history', label: 'System Logs', href: 'system-logs.html' },
                { icon: 'chat', label: 'Chat', href: 'chat.html' },
                { icon: 'notifications', label: 'Notifications', href: 'notifications.html' },
                { icon: 'settings', label: 'Settings', href: 'setting.html' },
                { icon: 'person', label: 'Profile', href: 'profile.html' }
            ],
            'school-admin': [
                ...commonLinks,
                { icon: 'teaching', label: 'Teachers', href: 'teachers.html' },
                { icon: 'group', label: 'Students', href: 'students.html' },
                { icon: 'family_history', label: 'Parents', href: 'parents.html' },
                { icon: 'class', label: 'Classes', href: 'classes.html' },
                { icon: 'menu_book', label: 'Subjects', href: 'subjects.html' },
                { icon: 'calendar_today', label: 'Schedule', href: 'schedule.html' },
                { icon: 'rule', label: 'Attendance', href: 'attendance.html' },
                { icon: 'assessment', label: 'Reports', href: 'reports.html' },
                { icon: 'analytics', label: 'Analytics', href: 'analytics.html' },
                { icon: 'chat', label: 'Chat', href: 'chat.html' },
                { icon: 'notifications', label: 'Notifications', href: 'notifications.html' },
                { icon: 'settings', label: 'Settings', href: 'setting.html' },
                { icon: 'person', label: 'Profile', href: 'profile.html' }
            ],
            'teacher': [
                ...commonLinks,
                { icon: 'school', label: 'My Courses', href: 'courses.html' },
                { icon: 'auto_stories', label: 'Lessons', href: 'lessons.html' },
                { icon: 'assignment', label: 'Assignments', href: 'assignments.html' },
                { icon: 'quiz', label: 'Quizzes', href: 'quizzes.html' },
                { icon: 'grade', label: 'Grades', href: 'grades.html' },
                { icon: 'rule', label: 'Attendance', href: 'attendance.html' },
                { icon: 'group', label: 'My Students', href: 'students.html' },
                { icon: 'calendar_today', label: 'Schedule', href: 'schedule.html' },
                { icon: 'analytics', label: 'Reports', href: 'reports.html' },
                { icon: 'chat', label: 'Chat', href: 'chat.html' },
                { icon: 'notifications', label: 'Notifications', href: 'notifications.html' },
                { icon: 'settings', label: 'Settings', href: 'setting.html' },
                { icon: 'person', label: 'Profile', href: 'profile.html' }
            ],
            'student': [
                ...commonLinks,
                { icon: 'school', label: 'My Courses', href: 'courses.html' },
                { icon: 'auto_stories', label: 'Lessons', href: 'lessons.html' },
                { icon: 'calendar_today', label: 'Schedule', href: 'schedule.html' },
                { icon: 'assignment', label: 'Assignments', href: 'assignments.html' },
                { icon: 'quiz', label: 'Quizzes', href: 'quizzes.html' },
                { icon: 'grade', label: 'Grades', href: 'grades.html' },
                { icon: 'rule', label: 'Attendance', href: 'attendance.html' },
                { icon: 'trending_up', label: 'Progress', href: 'progress.html' },
                { icon: 'verified', label: 'Certifications', href: 'certifications.html' },
                { icon: 'forum', label: 'Discussion', href: 'discussion.html' },
                { icon: 'analytics', label: 'Reports', href: 'reports.html' },
                { icon: 'chat', label: 'Community', href: 'chat.html' },
                { icon: 'notifications', label: 'Notifications', href: 'notifications.html' },
                { icon: 'person', label: 'Profile', href: 'profile.html' }
            ]
        };

        return roleLinks[role] || roleLinks['student'];
    },

    renderSidebar() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const nav = document.querySelector('nav');
        if (!nav) return;

        const links = this.getLinks(user.role);
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        nav.innerHTML = '';
        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = `sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg text-[#505f76] transition-all duration-200`;
            a.innerHTML = `
                <span class="material-symbols-outlined">${link.icon}</span>
                <span class="text-[12px] font-[500] leading-[16px] tracking-[0.05em]">${link.label}</span>
            `;
            if (currentPage === link.href) {
                a.classList.add('active');
                a.style.backgroundColor = 'rgba(37,99,235,0.1)';
                a.style.color = '#004ac6';
                a.style.borderLeft = '4px solid #004ac6';
                a.style.fontWeight = '700';
            }
            nav.appendChild(a);
        });
    }
};

// ============================================================
// 20. INIT - التهيئة
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // التأكد من وجود بيانات
    const users = DB.get('users');
    if (users.length === 0) {
        resetAndSeed();
    }

    // التحقق من صحة بيانات المستخدمين
    const admin = DB.get('users').find(u => u.email === 'admin@edumanage.com');
    if (admin && admin.role !== 'super-admin') {
        console.warn('⚠️ Fixing admin role...');
        admin.role = 'super-admin';
        admin.emailVerified = true;
        DB.set('users', DB.get('users'));
    }

    // تهيئة البيانات الفارغة
    if (!DB.get('certifications')) DB.set('certifications', []);
    if (!DB.get('discussions')) DB.set('discussions', []);
    if (!DB.get('discussionComments')) DB.set('discussionComments', []);
    if (!DB.get('lessonProgress')) DB.set('lessonProgress', []);

    UI.loadUserProfile();
    
    const user = Auth.getCurrentUser();
    if (user) {
        setTimeout(() => {
            SidebarManager.renderSidebar();
            console.log('✅ Sidebar rendered for', user.role);
        }, 100);
    }

    setInterval(() => UI.updateAllBadges(), 30000);
    UI.updateAllBadges();

    console.log('✅ EduManage App initialized!');
    console.log('📊 Users:', DB.get('users').map(u => u.role + ': ' + u.email));
});

console.log('✅ app.js loaded successfully!');



// ============================================================
// إضافة بيانات وهمية إضافية للمدارس والأدمن
// ============================================================
function addMoreSeedData() {
    const users = DB.get('users');
    const schools = DB.get('schools');
    
    // إضافة مدارس إضافية
    const extraSchools = [
        { name: 'American International School', location: 'New York, USA', status: 'active' },
        { name: 'British School of London', location: 'London, UK', status: 'active' },
        { name: 'Dubai Modern Academy', location: 'Dubai, UAE', status: 'active' },
        { name: 'Singapore International School', location: 'Singapore', status: 'pending' },
        { name: 'Toronto Global School', location: 'Toronto, Canada', status: 'inactive' }
    ];
    
    extraSchools.forEach(s => {
        if (!SchoolAPI.getAll().some(school => school.name === s.name)) {
            SchoolAPI.add(s);
        }
    });
    
    // إضافة أدمن للمدارس الجديدة
    const adminNames = ['Dr. Emily Clark', 'Mr. David Brown', 'Dr. Maria Garcia', 'Ms. Lisa Chen', 'Mr. James Wilson'];
    const schoolsList = SchoolAPI.getAll();
    
    schoolsList.forEach((school, index) => {
        const existingAdmin = Auth.getUsersBySchool(school.id).find(u => u.role === 'school-admin');
        if (!existingAdmin && index < adminNames.length) {
            Auth.addUser({
                name: adminNames[index % adminNames.length],
                email: `admin${index + 1}@${school.name.toLowerCase().replace(/\s/g, '')}.com`,
                password: 'password',
                role: 'school-admin',
                schoolId: school.id,
                avatar: `https://ui-avatars.com/api/?name=${adminNames[index % adminNames.length].replace(/\s/g, '+')}&background=004ac6&color=fff&size=128`,
                emailVerified: true
            });
        }
    });
    
    // إضافة طلاب ومدرسين للمدارس
    schoolsList.forEach(school => {
        const existingStudents = Auth.getUsersBySchool(school.id).filter(u => u.role === 'student');
        const existingTeachers = Auth.getUsersBySchool(school.id).filter(u => u.role === 'teacher');
        
        // إضافة طلاب إذا كان العدد قليل
        if (existingStudents.length < 5) {
            const studentNames = ['Ali Hassan', 'Sara Ahmed', 'Omar Khaled', 'Layla Nasser', 'Youssef Tamer'];
            studentNames.forEach((name, i) => {
                if (i < 3) {
                    Auth.addUser({
                        name: name,
                        email: `${name.toLowerCase().replace(/\s/g, '.')}@${school.name.toLowerCase().replace(/\s/g, '')}.com`,
                        password: 'password',
                        role: 'student',
                        schoolId: school.id,
                        avatar: `https://ui-avatars.com/api/?name=${name.replace(/\s/g, '+')}&background=2563eb&color=fff&size=128`,
                        emailVerified: true,
                        enrolledCourses: []
                    });
                }
            });
        }
        
        // إضافة مدرسين إذا كان العدد قليل
        if (existingTeachers.length < 2) {
            const teacherNames = ['Dr. Ahmed Hassan', 'Prof. Mona Ibrahim'];
            teacherNames.forEach((name, i) => {
                if (i < 1) {
                    Auth.addUser({
                        name: name,
                        email: `${name.toLowerCase().replace(/\s/g, '.')}@${school.name.toLowerCase().replace(/\s/g, '')}.com`,
                        password: 'password',
                        role: 'teacher',
                        schoolId: school.id,
                        subject: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'][i % 5],
                        avatar: `https://ui-avatars.com/api/?name=${name.replace(/\s/g, '+')}&background=38485d&color=fff&size=128`,
                        emailVerified: true
                    });
                }
            });
        }
    });
    
    console.log('✅ Extra seed data added!');
    console.log('📊 Total Schools:', SchoolAPI.getAll().length);
    console.log('📊 Total Users:', Auth.getUsersByRole('all').length);
}

// استدعاء الدالة بعد seedData
setTimeout(() => {
    addMoreSeedData();
}, 500);


// ============================================================
// إضافة بيانات وهمية للشات والإشعارات
// ============================================================
function generateChatAndNotificationData() {
    const users = DB.get('users');
    const superAdmin = users.find(u => u.role === 'super-admin');
    const schoolAdmins = users.filter(u => u.role === 'school-admin');
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');

    if (!superAdmin) return;

    // Generate chat messages
    const chats = DB.get('chats') || [];
    if (chats.length < 20) {
        const messages = [
            'Hello! How can I help you today?',
            'I need to update the school curriculum.',
            'Can you review the new student applications?',
            'The platform is working great!',
            'I have a question about the schedule.',
            'When is the next meeting?',
            'Please check the new assignment I posted.',
            'Great job on the recent updates!',
            'I need access to the analytics dashboard.',
            'The students are loving the new features.',
            'Can we schedule a training session?',
            'I noticed a small bug in the attendance module.',
            'The reports are looking good this month.',
            'Thank you for the quick response!',
            'I will share the updates with the team.',
            'The new dashboard is very intuitive.',
            'Can you help me with the student enrollment?',
            'The system is running smoothly today.',
            'I have some feedback about the UI.',
            'Looking forward to the next release!'
        ];

        const recipients = [...schoolAdmins, ...teachers, ...students];
        recipients.forEach(recipient => {
            const msgCount = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < msgCount; i++) {
                chats.push({
                    id: DB.genId(),
                    senderId: i % 2 === 0 ? superAdmin.id : recipient.id,
                    receiverId: i % 2 === 0 ? recipient.id : superAdmin.id,
                    message: messages[Math.floor(Math.random() * messages.length)],
                    read: Math.random() > 0.3,
                    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        });

        // Public messages
        const publicMessages = [
            'Welcome to EduManage! 🎉',
            'New feature: Real-time analytics!',
            'System maintenance scheduled for Sunday.',
            'Happy learning everyone! 📚',
            'New courses added to the platform.',
            'Check out the new chat features!',
            'Don\'t forget to update your profile.',
            'The platform is now available in 3 languages!',
            'Exciting updates coming next week!',
            'Thank you for being part of our community!'
        ];

        publicMessages.forEach(msg => {
            chats.push({
                id: DB.genId(),
                senderId: superAdmin.id,
                receiverId: 'public',
                message: msg,
                read: true,
                timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
            });
        });

        DB.set('chats', chats);
        console.log('✅ Chat data generated:', chats.length, 'messages');
    }

    // Generate notifications
    const notifications = DB.get('notifications') || [];
    if (notifications.length < 30) {
        const notificationTemplates = [
            { title: 'New User Registered', message: 'A new user has joined the platform.', type: 'info' },
            { title: 'School Added', message: 'A new school has been registered.', type: 'success' },
            { title: 'System Update', message: 'New features have been deployed.', type: 'info' },
            { title: 'Security Alert', message: 'Unusual login activity detected.', type: 'warning' },
            { title: 'Subscription Renewed', message: 'A school subscription has been renewed.', type: 'success' },
            { title: 'New Message', message: 'You have a new message from a contact.', type: 'message' },
            { title: 'Report Generated', message: 'Monthly report has been generated.', type: 'info' },
            { title: 'Certificate Issued', message: 'A new certificate has been issued.', type: 'success' },
            { title: 'Quiz Submitted', message: 'A student submitted a quiz.', type: 'info' },
            { title: 'Assignment Graded', message: 'An assignment has been graded.', type: 'success' }
        ];

        users.forEach(user => {
            const notifCount = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < notifCount; i++) {
                const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
                notifications.push({
                    id: DB.genId(),
                    userId: user.id,
                    title: template.title,
                    message: template.message,
                    type: template.type,
                    read: Math.random() > 0.5,
                    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        });

        DB.set('notifications', notifications);
        console.log('✅ Notification data generated:', notifications.length, 'notifications');
    }
}

// استدعاء الدالة
setTimeout(() => {
    generateChatAndNotificationData();
}, 1000);


// ============================================================
// التأكد من وجود بيانات الإشعارات عند تحميل الصفحة
// ============================================================
function ensureNotificationData() {
    const users = DB.get('users');
    if (users.length < 2) return;

    let notifications = DB.get('notifications') || [];
    if (notifications.length < 10) {
        console.log('🔄 Generating notification data from app.js...');
        
        const templates = [
            { title: 'New User Registered', message: 'A new user has joined the platform.', type: 'info' },
            { title: 'School Added 🏫', message: 'A new school has been registered.', type: 'success' },
            { title: 'System Update', message: 'New features have been deployed.', type: 'info' },
            { title: 'Security Alert ⚠️', message: 'Unusual login activity detected.', type: 'warning' },
            { title: 'Subscription Renewed', message: 'A school subscription has been renewed.', type: 'success' },
            { title: 'New Message 💬', message: 'You have a new message from a contact.', type: 'message' },
            { title: 'Report Generated 📊', message: 'Monthly report has been generated.', type: 'info' },
            { title: 'Certificate Issued 🎓', message: 'A new certificate has been issued.', type: 'success' },
            { title: 'Quiz Submitted 📝', message: 'A student submitted a quiz.', type: 'info' },
            { title: 'Assignment Graded', message: 'An assignment has been graded.', type: 'success' },
            { title: 'New Course Added 📚', message: 'A new course has been added to the platform.', type: 'info' },
            { title: 'Attendance Updated', message: 'Student attendance has been updated.', type: 'info' },
            { title: 'Schedule Changed', message: 'Class schedule has been updated.', type: 'warning' },
            { title: 'Student Enrolled', message: 'A new student has been enrolled.', type: 'success' },
            { title: 'Teacher Assigned', message: 'A new teacher has been assigned to a course.', type: 'info' },
            { title: 'Grade Posted 📊', message: 'New grades have been posted.', type: 'success' },
            { title: 'Discussion Started 💬', message: 'A new discussion has been started.', type: 'info' },
            { title: 'Event Reminder 📅', message: 'Upcoming event reminder.', type: 'warning' }
        ];

        users.forEach(user => {
            if (!user) return;
            const count = Math.floor(Math.random() * 6) + 3;
            for (let i = 0; i < count; i++) {
                const template = templates[Math.floor(Math.random() * templates.length)];
                notifications.push({
                    id: DB.genId(),
                    userId: user.id,
                    title: template.title,
                    message: template.message,
                    type: template.type,
                    read: i < 2 || Math.random() > 0.6,
                    timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        });

        DB.set('notifications', notifications);
        console.log('✅ Notifications data generated from app.js:', notifications.length);
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        ensureNotificationData();
    }, 200);
});

