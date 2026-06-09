import type {
  GuestMessage,
  InvitationAddOn,
  InvitationWorkspaceData,
  InvitationWorkspaceGuest,
} from "@/lib/types/invitation-workspace"

export const DEMO_INVITATION_ID = "demo"

const guestRows: InvitationWorkspaceGuest[] = [
  {
    id: "guest-1",
    name: "Anak Agung Ngurah Aditya Wirayudha",
    whatsApp: "6284620972344",
    email: "adityawir@gmail.com",
    category: "vip",
    attendance: "attending",
    guestCount: 2,
    delivered: true,
  },
  {
    id: "guest-2",
    name: "Wayan Putri Maharani",
    whatsApp: "6281277719023",
    email: "wayanputri@gmail.com",
    category: "regular",
    attendance: "declined",
    guestCount: 2,
    delivered: false,
  },
  {
    id: "guest-3",
    name: "Kadek Arya Pratama",
    whatsApp: "6281356789012",
    email: "kadekarya@gmail.com",
    category: "regular",
    attendance: "pending",
    guestCount: 1,
    delivered: true,
  },
  {
    id: "guest-4",
    name: "Ni Luh Komang Dewi",
    whatsApp: "6282112233445",
    email: "komangdewi@gmail.com",
    category: "regular",
    attendance: "attending",
    guestCount: 2,
    delivered: false,
  },
  {
    id: "guest-5",
    name: "I Made Gede Baskara",
    whatsApp: "6281245678910",
    email: "madegede@gmail.com",
    category: "vip",
    attendance: "attending",
    guestCount: 2,
    delivered: true,
  },
  {
    id: "guest-6",
    name: "Putu Laksmi Sari",
    whatsApp: "6281789012345",
    email: "putulaksmi@gmail.com",
    category: "regular",
    attendance: "pending",
    guestCount: 1,
    delivered: false,
  },
  {
    id: "guest-7",
    name: "Desak Nyoman Cahyani",
    whatsApp: "6282211988776",
    email: "desakcahyani@gmail.com",
    category: "regular",
    attendance: "attending",
    guestCount: 3,
    delivered: true,
  },
  {
    id: "guest-8",
    name: "Komang Adi Surya",
    whatsApp: "6281444556677",
    email: "komangadi@gmail.com",
    category: "vip",
    attendance: "attending",
    guestCount: 2,
    delivered: true,
  },
  {
    id: "guest-9",
    name: "Gusti Ayu Puspita",
    whatsApp: "6282244668800",
    email: "gustiayu@gmail.com",
    category: "regular",
    attendance: "pending",
    guestCount: 2,
    delivered: false,
  },
  {
    id: "guest-10",
    name: "Bagus Mahendra",
    whatsApp: "6282333444555",
    email: "bagusm@gmail.com",
    category: "regular",
    attendance: "attending",
    guestCount: 2,
    delivered: true,
  },
]

const messageRows: GuestMessage[] = [
  {
    id: "message-1",
    senderName: "Wayan & Partner",
    category: "regular",
    submittedAt: "22:10 · 07 Mar 26",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    hidden: false,
    voiceNoteDuration: "02:30",
  },
  {
    id: "message-2",
    senderName: "Komang & Family",
    category: "vip",
    submittedAt: "21:48 · 07 Mar 26",
    content:
      "Selamat untuk kalian berdua. Semoga seluruh persiapan menuju hari bahagia berjalan lancar dan penuh sukacita. Kami tidak sabar hadir merayakan momen ini bersama kalian.",
    hidden: true,
  },
  {
    id: "message-3",
    senderName: "Ayu & Partner",
    category: "regular",
    submittedAt: "20:35 · 07 Mar 26",
    content:
      "Terima kasih sudah mengundang kami. Template undangannya cantik sekali dan informasinya jelas. Semoga acaranya lancar sampai hari-H.",
    hidden: false,
    voiceNoteDuration: "01:42",
  },
  {
    id: "message-4",
    senderName: "Made & Team",
    category: "vip",
    submittedAt: "20:10 · 07 Mar 26",
    content:
      "Kami ikut berbahagia. Semoga rumah tangga yang dibangun selalu dipenuhi cinta, kebijaksanaan, dan keberkahan dalam setiap langkahnya.",
    hidden: false,
  },
]

const addOns: InvitationAddOn[] = [
  {
    id: "instagram-filter",
    title: "Instagram Filter & Add Yours",
    subtitle: "Jadikan pernikahanmu viral!",
    description:
      "Filter Instagram khusus dan template Add Yours agar tamu dapat berbagi momen secara instan.",
    price: 10000,
    status: "active",
    accent: "instagram",
    ctaLabel: "Atur Sekarang",
  },
  {
    id: "multi-language",
    title: "Multi-language Invitation",
    subtitle: "Buat setiap tamu merasa dilibatkan",
    description:
      "Terjemahkan undangan Anda untuk tamu internasional dan buat komunikasi menjadi mudah.",
    price: 10000,
    status: "locked",
    accent: "language",
    ctaLabel: "Beli sekarang!",
  },
  {
    id: "gallery-momenia",
    title: "Gallery Momenia",
    subtitle: "Galeri kenangan interaktif",
    description:
      "Buat galeri momen pernikahan yang indah dengan foto, musik, dan alur cerita.",
    price: 10000,
    status: "locked",
    accent: "gallery",
    ctaLabel: "Beli sekarang!",
  },
]

export function getInvitationWorkspaceData(
  invitationId: string,
  locale: string,
): InvitationWorkspaceData {
  return {
    id: invitationId,
    title: "Romeo & Juliet Wedding",
    eventDateLabel: locale === "id" ? "20 Desember 2026" : "20 December 2026",
    previewImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    planName: locale === "id" ? "Paket 3 Bulan" : "3 Month Plan",
    activeUntilLabel:
      locale === "id" ? "Aktif s/d 31 Desember 2026" : "Active until 31 December 2026",
    countdown: {
      days: 23,
      hours: 16,
      minutes: 34,
      seconds: 21,
    },
    stats: {
      totalGuests: 226,
      attending: 90,
      declined: 12,
      pending: 124,
      estimatedGuests: 598,
    },
    invitationLink: {
      prefix: "https://www.momenia/",
      slug: "AdityNuda_momenia",
      suffix: ".com",
    },
    messageTemplate:
      locale === "id"
        ? "Ketik template pesan di sini atau klik Generate Invitation Text untuk membuat template pesan otomatis."
        : "Type a guest message template here or click Generate Invitation Text to create one automatically.",
    guests: guestRows,
    messages: messageRows,
    afterPartyNote: {
      galleryUrl: "https://momenia.gallery/romeo-juliet",
      souvenirLabel: "johnDoe@gmail.com",
      message:
        "Thank you for celebrating our special day. Here is the photo gallery and our after party note for you.",
    },
    addOns,
  }
}
