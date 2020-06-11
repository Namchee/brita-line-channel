/* eslint-disable max-len */

export enum REPLY {
  INPUT_CATEGORY = 'Oke, Brita akan carikan pengumuman buat kamu. Kamu mau pengumuman dengan kategori apa?\n\nKategori-kategori yang tersedia adalah:',
  NO_CATEGORY = 'Hmm... Sekarang gak ada kategori yang dapat diminta...',
  UNKNOWN_CATEGORY = 'Hmm... Brita gak tau kategori apa yang kamu masukkan. Mungkin ajah karena kamu salah ketik.\nBisa tolong masukkan lagi?',
  UNIDENTIFIABLE = 'Hmm... Brita gak ngerti apa yang kamu minta. Entah karena kamu salah ketik atau sesi permintaan kamu habis.\n\nSilahkan ulang permintaan kamu lagi ya~',
  SHOW_ANNOUNCEMENT = 'Berikut ini adalah beberapa pengumuman yang sesuai dengan kriteria yang kamu minta',
  PROMPT_ANNOUNCEMENT = 'Sekarang, apakah kamu masih mau melanjutkan baca pengumuman?\n\nKamu dapat memilih\n**lanjutkan** untuk melihat pengumuman selanjutnya\n**ganti** untuk mengubah kategori\n**akhiri** untuk menyelesaikan permintaan',
  RECHOOSE_CATEGORY_LABEL = 'Ganti Kategori',
  RECHOOSE_CATEGORY_TEXT = 'Ganti',
  NEXT_ANNOUNCEMENT_LABEL = 'Lanjut Baca',
  NEXT_ANNOUNCEMENT_TEXT = 'Lanjutkan',
  END_ANNOUNCEMENT_LABEL = 'Selesai Baca',
  END_ANNOUNCEMENT_TEXT = 'Akhiri',
  END_REQUEST_LABEL = 'Batal',
  END_REQUEST_TEXT = 'Batalkan permintaan',
  END_REQUEST_REPLY = 'Baiklah. Terima kasih udah pakai Brita! Semoga harimu menyenangkan!',
  NO_ANNOUNCEMENT = 'Hmm... Saat ini, udah gak ada pengumuman lagi yang tersedia buat kategori tersebut.',
  SERVER_ERROR = 'Terjadi masalah pada server, mohon coba dalam beberapa saat lagi.\n\nApabila error masih berlanjut, hubungi pengembang.',
  SUBSCRIBE_CATEGORY = 'Oke, Brita akan membuatkan subscription kategori buat kamu.\n\nKamu tertarik dengan pengumuman kategori apa? Kategori-kategori yang tersedia adalah:',
  SUBCRIPTION_SUCCESS = 'Oke, nanti ketika ada pengumuman dengan kategori tersebut, Brita akan beritahu kamu secara langsung.\n\nPsst.. Kamu dapat menghentikan subscription ini dengan perintah `unsubscribe`',
  NO_SUBSCRIPTION = 'Hmm... Sepertinya kamu tidak memiliki subscription apapun.\n\nKamu bisa coba subscribe pada sebuah kategori dengan mengirimkan `subscribe`',
  UNSUBSCRIBE_CATEGORY = 'Oke, Brita akan menghapus salah satu subscription kamu.\n\nKamu mau menghapus subscription untuk kategori apa? Kategori-kategori yang kamu subscribe adalah:',
  NOT_SUBSCRIBED = 'Maaf, namun sepertinya kamu tidak subscribe pada kategori yang kamu minta atau kategori tersebut tidak ada.',
  UNSUBSCRIBED = 'Kamu telah berhenti berlangganan untuk kategori tersebut.\n\nMulai sekarang, Brita tidak akan beritahu kamu secara langsung tentang topik tersebut.'
}

export enum LOGIC_ERROR {
  INCORRECT_MAPPING = 'Incorrect service mapping',
  INCORRECT_LOGIC = 'Logic error',
  BREACH_OF_FLOW = 'Breach of flow, should be killed earlier',
  CACHE_NOT_SET = 'Cache has not been set properly',
  ENV_NOT_SET = 'Environment variables has not been set properly',
}
