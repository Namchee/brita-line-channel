# Brita LINE Channel

[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts) [![dependencies](https://img.shields.io/david/namchee/brita-line-channel)](https://david-dm.org/namchee/brita-line-channel) [![devDependencies](https://img.shields.io/david/dev/namchee/brita-line-channel)](https://david-dm.org/namchee/brita-line-channel?type=dev)

[LINE](https://line.me) _chatbot_ untuk ekosistem [brita](https://github.com/Namchee/brita-api).

## Fitur

1. _Stateful_, _state_ disimpan pada sebuah [_in-memory data store_](https://redis.io/) dan memiliki masa berlaku supaya tidak memenuhi memori.
2. Penggunaan fitur Messaging API LINE terbaru, seperti Flex Message.

## Daftar Layanan

1. Menunjukan daftar pengumuman yang masih berlaku

## Prasyarat

1. NodeJS versi >= 12.x.x
2. NPM versi >= 6.13.x.x
3. Now CLI

Catatan: Mungkin aplikasi bisa dijalankan pada versi yang lebih rendah, namun saya tidak menjamin hal tersebut.

## Instalasi

1. _Clone_ repository ini
2. Buat file `.env` pada pada _root_ folder, isi sesuai instruksi yang sudah diberikan pada `.env.example`
3. Lakukan `npm install`
4. Uji aplikasi dengan menjalankan perintah `now dev`

## Deployment

[![Deploy with ZEIT Now](https://zeit.co/button)](https://zeit.co/import/project?template=https://github.com/Namchee/brita-line-channel/tree/master)
