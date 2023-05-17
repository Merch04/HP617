const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role: { type: DataTypes.STRING }, // STUDENT,TEACHER,ADMIN
  name: { type: DataTypes.STRING },
  surname: { type: DataTypes.STRING },
  middlename: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  phones: { type: DataTypes.JSON },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  socialNetworks: { type: DataTypes.JSON },
  description: { type: DataTypes.STRING },
  officeId: { type: DataTypes.INTEGER }
})
const NoAuthUser = sequelize.define('noAuthUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING },
  surname: { type: DataTypes.STRING },
  middlename: { type: DataTypes.STRING },
  responsibleUser: { type: DataTypes.UUID },
  code: { type: DataTypes.STRING, unique: true }
})

const Teacher = sequelize.define('teacher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
},
  { timestamps: false })
const Student = sequelize.define('student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  diplomTheme: { type: DataTypes.STRING },
},
  { timestamps: false })

const Department = sequelize.define('department', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  },
},
  { timestamps: false })


const Group = sequelize.define('group', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  year_add: { type: DataTypes.DATE }

},
  { timestamps: false })
const Degree = sequelize.define('degree', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  shortName: { type: DataTypes.STRING }

},
  { timestamps: false })
const Rank = sequelize.define('rank', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  }

},
  { timestamps: false })


const Company = sequelize.define('company', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  website: { type: DataTypes.STRING },
  office: { type: DataTypes.ARRAY(DataTypes.STRING) }

},
  { timestamps: false })
const Vacancy = sequelize.define('vacancy', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  },
},
  { timestamps: false })

const Notes = sequelize.define('note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.STRING,
  }

}, { timestamps: false })
User.hasMany(Notes, {
  as: 'teacher',
  foreignKey: 'teacherUserId'
})
User.hasMany(Notes, {
  as: 'student',
  foreignKey: 'studentUserId'
})
Notes.belongsTo(User, {
  as: 'teacher',
  foreignKey: 'teacherUserId'
})
Notes.belongsTo(User, {
  as: 'student',
  foreignKey: 'studentUserId'
})


Teacher.hasOne(User, {
  onDelete: 'cascade',
  hooks: true,
})
Student.hasOne(User, {
  onDelete: 'cascade',
  hooks: true,
})
User.belongsTo(Teacher)
User.belongsTo(Student)

User.hasMany(Student, {
  foreignKey: "teacherId"
})

Vacancy.hasMany(User)
User.belongsTo(Vacancy)
Company.hasMany(User)
User.belongsTo(Company)

Degree.hasMany(Teacher)
Teacher.belongsTo(Degree)
Rank.hasMany(Teacher)
Teacher.belongsTo(Rank)

Group.hasMany(Student)
Student.belongsTo(Group)
Department.hasMany(Student)
Student.belongsTo(Department)


const TeacherDepartment = sequelize.define('TeacherDepartments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
},
  { timestamps: false })
Department.hasMany(TeacherDepartment)
Teacher.hasMany(TeacherDepartment)
TeacherDepartment.belongsTo(Department)
TeacherDepartment.belongsTo(Teacher)


const NotificationsToTeacher = sequelize.define('NotificationsToTeacher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
},
  { timestamps: false })
User.hasMany(NotificationsToTeacher, {
  as: 'sender',
  foreignKey: 'senderUserId'
})
User.hasMany(NotificationsToTeacher, {
  as: 'dest',
  foreignKey: 'destUserId'
})
NotificationsToTeacher.belongsTo(User, {
  as: 'sender',
  foreignKey: 'senderUserId'
})
NotificationsToTeacher.belongsTo(User, {
  as: 'dest',
  foreignKey: 'destUserId'
})

module.exports = {
  User, Teacher, Student, Group, Department, Degree, Rank, Company, Vacancy, NoAuthUser, NotificationsToTeacher, Notes
}