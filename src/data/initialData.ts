import { CalendarEvent, TeamModel, FriendShare, NotificationItem } from '../types';

export const getInitialEvents = (): CalendarEvent[] => {
  const today = new Date();
  
  const createDate = (daysOffset: number, hours: number, minutes: number = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'event-1',
      title: 'Duruşma Öncesi Dosya İncelemesi',
      startTime: createDate(0, 9, 30),
      endTime: createDate(0, 11, 0),
      reminderMinutesBefore: 60,
      category: 'Hukuk',
      location: 'Çağlayan Adliyesi 4. Asliye Hukuk',
      description: 'Dava dilekçesi ekleri ve bilirkişi raporu son kontrolü.',
      isCompleted: true,
    },
    {
      id: 'event-2',
      title: 'Kadıköy Noterliği Sözleşme Onayı',
      startTime: createDate(0, 14, 0),
      endTime: createDate(0, 15, 0),
      reminderMinutesBefore: 60,
      category: 'Resmi',
      location: 'Kadıköy 12. Noterliği',
      description: 'Vekaletname ve şirket ana sözleşmesi imza süreci.',
      isCompleted: false,
    },
    {
      id: 'event-3',
      title: 'Hukuk Bürosu & Dava Ekibi Toplantısı',
      startTime: createDate(0, 16, 30),
      endTime: createDate(0, 17, 30),
      reminderMinutesBefore: 30,
      category: 'Toplantı',
      location: 'Zoom / Ana Toplantı Salonu',
      description: 'Haftalık dava değerlendirmesi ve iş dağılımı.',
      isCompleted: false,
      teamId: 'team-1',
      teamName: 'Hukuk Bürosu & Dava Ekibi',
    },
    {
      id: 'event-4',
      title: 'Akşam Kardiyo & Esneme',
      startTime: createDate(0, 19, 0),
      endTime: createDate(0, 20, 0),
      reminderMinutesBefore: 45,
      category: 'Spor',
      location: 'MacFit Moda',
      description: 'Günün stresini atmak için 45 dk tempolu koşu.',
      isCompleted: false,
    },
    {
      id: 'event-5',
      title: 'Hakimlik & Savcılık Sınavı Mevzuat Tekrarı',
      startTime: createDate(1, 10, 0),
      endTime: createDate(1, 12, 30),
      reminderMinutesBefore: 30,
      category: 'Ders',
      location: 'Çalışma Odası',
      description: 'İdare hukuku ve ceza muhakemesi soru çözümleri.',
      isCompleted: false,
      teamId: 'team-2',
      teamName: 'Hakimlik Sınavı Çalışma Grubu',
    },
    {
      id: 'event-6',
      title: 'Müvekkil Danışmanlık Görüşmesi',
      startTime: createDate(1, 15, 0),
      endTime: createDate(1, 16, 0),
      reminderMinutesBefore: 60,
      category: 'Hukuk',
      location: 'Ofis / Kadıköy',
      description: 'Gayrimenkul devir süreci bilgilendirme toplantısı.',
      isCompleted: false,
    },
  ];
};

export const initialTeams: TeamModel[] = [
  {
    id: 'team-1',
    name: 'Hukuk Bürosu & Dava Ekibi',
    description: 'Büro içi dava takipleri, adliye görevleri ve duruşma koordinasyonu.',
    role: 'admin',
    memberCount: 6,
    remindersCount: 4,
    isAdmin: true,
    members: [
      { id: 'm-1', name: 'Av. Avni Kavalcı', role: 'Yönetici (Admin)', avatar: 'AK' },
      { id: 'm-2', name: 'Av. Selin Yıldız', role: 'Kıdemli Avukat', avatar: 'SY' },
      { id: 'm-3', name: 'Stj. Burak Kaya', role: 'Stajyer Avukat', avatar: 'BK' },
      { id: 'm-4', name: 'Merve Demir', role: 'Katip', avatar: 'MD' },
    ],
    reminders: [
      {
        id: 'tr-1',
        teamId: 'team-1',
        title: 'Bilirkişi Raporuna İtiraz Dilekçesi Son Günü',
        description: 'Tüm ekibin dosya no 2026/412 için incelemesi şarttır.',
        startTime: '2026-08-22T17:00:00',
        endTime: '2026-08-22T18:00:00',
        category: 'Hukuk',
        location: 'UYAP Portal',
        createdBy: 'm-1',
        createdByName: 'Av. Avni Kavalcı',
      },
      {
        id: 'tr-2',
        teamId: 'team-1',
        title: 'Toplu Duruşma Evrakı Teslimi',
        description: 'Kartal Anadolu Adliyesi 2. Asliye Ticaret',
        startTime: '2026-08-23T11:00:00',
        endTime: '2026-08-23T12:00:00',
        category: 'Resmi',
        location: 'Kartal Anadolu Adliyesi',
        createdBy: 'm-1',
        createdByName: 'Av. Avni Kavalcı',
      },
    ],
  },
  {
    id: 'team-2',
    name: 'Hakimlik Sınavı Çalışma Grubu',
    description: 'Adli ve idari yargı sınavı soru bankası ve deneme sınavı paylaşımları.',
    role: 'member',
    memberCount: 12,
    remindersCount: 8,
    isAdmin: false,
    members: [
      { id: 'm-5', name: 'Dr. Kerem Tan', role: 'Yönetici (Admin)', avatar: 'KT' },
      { id: 'm-1', name: 'Av. Avni Kavalcı', role: 'Üye', avatar: 'AK' },
      { id: 'm-6', name: 'Deniz Eren', role: 'Üye', avatar: 'DE' },
    ],
    reminders: [
      {
        id: 'tr-3',
        teamId: 'team-2',
        title: 'Online Türkiye Geneli Deneme Sınavı #4',
        description: '100 Soru - Süre: 120 Dakika',
        startTime: '2026-08-24T20:00:00',
        endTime: '2026-08-24T22:00:00',
        category: 'Ders',
        location: 'Online Platform',
        createdBy: 'm-5',
        createdByName: 'Dr. Kerem Tan',
      },
    ],
  },
];

export const initialFriends: FriendShare[] = [
  {
    id: 'f-1',
    name: 'Av. Zeynep Aksoy',
    email: 'zeynep.aksoy@hukuk.com',
    avatar: 'ZA',
    role: 'Salt Okunur Ortak',
    sharedCount: 3,
    lastActive: '10 dk önce',
  },
  {
    id: 'f-2',
    name: 'Müh. Caner Polat',
    email: 'caner.polat@tech.com',
    avatar: 'CP',
    role: 'Salt Okunur Ortak',
    sharedCount: 1,
    lastActive: '1 saat önce',
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'morning',
    title: 'Sabah 07:00 Güne Başlama',
    subtitle: 'Bugün 4 randevunuz var. İlk etkinlik: 09:30 Duruşma İncelemesi.',
    time: '07:00',
    isRead: false,
  },
  {
    id: 'n-2',
    type: 'reminder',
    title: 'T-60 Dakika: Kadıköy Noterliği',
    subtitle: 'Yol ve hazırlık tamponu: 14:00 randevunuz için 13:00 itibarıyla çıkış önerilir.',
    time: '13:00',
    isRead: false,
  },
  {
    id: 'n-3',
    type: 'summary',
    title: 'Gece 00:00 Günün Özeti',
    subtitle: 'Yarın için planlanan tüm etkinlikler takviminizde güncellendi.',
    time: '00:00',
    isRead: true,
  },
];
