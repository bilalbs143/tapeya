export const Pages = {
  dashboard: {
    title: 'Dashboard',
    icon: 'ft-home',
  },
  adminMenu: {
    title: 'Admininstration',
    icon: 'ft-users',
    permission: 'admin.view|role.view|admin.analytics.view',
    analytics: {
      title: 'Admin Analytics',
      icon: 'ft-bar-chart',
      permission: 'admin.analytics.view',
      dashboard: {
        title: 'Analytics Dashboard',
        icon: 'ft-home',
        permission: 'admin.analytics.view',
      },
      list: {
        title: 'Analytics List',
        icon: 'ft-align-justify',
        permission: 'admin.analytics.view',
      },
    },
    admins: {
      title: 'Admins',
      icon: 'ft-user',
      permission: 'admin.view',
      assignPermissions: {
        title: 'Assign Permmissions | Admin',
        permission: 'role.edit & admin.edit & admin.view & permission.view',
      },
    },
    roles: {
      title: 'Roles',
      icon: 'ft-award',
      permission: 'role.view',
      assignPermissions: {
        title: 'Assign Permmissions | Role',
        permission: 'role.edit & role.view & permission.view',
      },
    },
    permissions: {
      title: 'Permissions',
      icon: 'ft-wind',
      permission: 'permission.view1',
    },
  },
  userMenu: {
    title: 'Users',
    icon: 'ft-user',
    permission: 'user.analytics.view',
    analytics: {
      title: 'User Analytics',
      icon: 'ft-bar-chart',
      permission: 'user.analytics.view',
      dashboard: {
        title: 'Analytics Dashboard',
        icon: 'ft-home',
        permission: 'user.analytics.view',
      },
      list: {
        title: 'Analytics List',
        icon: 'ft-align-justify',
        permission: 'user.analytics.view',
      },
    },
    users: {
      title: 'Users',
      icon: 'ft-user',
      permission: 'user.view',
    },
  },
  mcqMenu: {
    title: 'Mcqs',
    icon: 'ft-book-open',
  },
  matrimonyMenu: {
    title: 'Matrimony',
    icon: 'ft-heart',
    profile: {
      title: 'Profiles',
      icon: 'ft-image',
    },
  },
  lastAid: {
    title: 'Last Aid',
    icon: 'ft-file-plus',
  },
  mcqs: {
    title: 'MCQs',
    icon: 'ft-grid',
    permission: 'mcq.view|mcq.dashboard.view',
    dashboard: {
      title: 'Dashboard',
      icon: 'ft-home',
      permission: 'mcq.dashboard.view',
    },
    mcqs: {
      permission: 'mcq.view',
    },
    history: {
      title: 'MCQ History',
      permission: 'mcq.history.view',
    },
  },
  studyRoomMenu: {
    title: 'Study Room',
    icon: 'ft-book-open',
    permission: 'past-paper.view|subject.view',
    past_paper: {
      title: 'Past Papers',
      icon: 'ft-hard-drive',
      permission: 'past-paper.view',
    },
    subject: {
      title: 'Subjects',
      icon: 'ft-codepen',
      permission: 'subject.view',
    },
    unit: {
      title: 'Units',
      icon: 'ft-compass',
      permission: 'unit.view',
    },
    topic: {
      title: 'Topics',
      icon: 'ft-cloud-rain',
      permission: 'topic.view',
    },
    subTopic: {
      title: 'Sub Topics',
      icon: 'ft-cloud-snow',
      permission: 'sub-topic.view',
    },
  },
};
