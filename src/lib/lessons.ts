export interface Vocab {
  word: string;
  th: string;
  en: string;
}

export interface Lesson {
  id: number;
  icon: string;
  color: string;
  words: Vocab[];
}

export const lessons: Lesson[] = [
  {
    id: 0,
    icon: 'sun',
    color: 'bg-amber-400',
    words: [
      { word: 'Hello', th: 'สวัสดี', en: 'Hello (greeting)' },
      { word: 'Goodbye', th: 'ลาก่อน', en: 'Goodbye' },
      { word: 'Thank you', th: 'ขอบคุณ', en: 'Thank you' },
      { word: 'Sorry', th: 'ขอโทษ', en: 'Sorry' },
      { word: 'Please', th: 'กรุณา / โปรด', en: 'Please' },
      { word: 'Yes', th: 'ใช่ / ตกลง', en: 'Yes' },
      { word: 'No', th: 'ไม่ / ไม่ใช่', en: 'No' },
      { word: 'Water', th: 'น้ำเปล่า', en: 'Water' },
      { word: 'Good morning', th: 'สวัสดีตอนเช้า', en: 'Good morning' },
      { word: 'Bye', th: 'ไปก่อนนะ', en: 'Bye (informal)' }
    ],
  },
  {
    id: 1,
    icon: 'palette',
    color: 'bg-rose-400',
    words: [
      { word: 'Red', th: 'สีแดง', en: 'Red' },
      { word: 'Blue', th: 'สีน้ำเงิน', en: 'Blue' },
      { word: 'Green', th: 'สีเขียว', en: 'Green' },
      { word: 'Yellow', th: 'สีเหลือง', en: 'Yellow' },
      { word: 'One', th: 'หนึ่ง', en: 'One' },
      { word: 'Two', th: 'สอง', en: 'Two' },
      { word: 'Three', th: 'สาม', en: 'Three' },
      { word: 'Ten', th: 'สิบ', en: 'Ten' },
      { word: 'Black', th: 'สีดำ', en: 'Black' },
      { word: 'White', th: 'สีขาว', en: 'White' }
    ],
  },
  {
    id: 2,
    icon: 'cat',
    color: 'bg-emerald-400',
    words: [
      { word: 'Cat', th: 'แมว', en: 'Cat' },
      { word: 'Dog', th: 'หมา', en: 'Dog' },
      { word: 'Bird', th: 'นก', en: 'Bird' },
      { word: 'Fish', th: 'ปลา', en: 'Fish' },
      { word: 'Elephant', th: 'ช้าง', en: 'Elephant' },
      { word: 'Tiger', th: 'เสือ', en: 'Tiger' },
      { word: 'Monkey', th: 'ลิง', en: 'Monkey' },
      { word: 'Rabbit', th: 'กระต่าย', en: 'Rabbit' },
      { word: 'Snake', th: 'งู', en: 'Snake' },
      { word: 'Butterfly', th: 'ผีเสื้อ', en: 'Butterfly' }
    ],
  },
  {
    id: 3,
    icon: 'utensils',
    color: 'bg-orange-400',
    words: [
      { word: 'Rice', th: 'ข้าว', en: 'Rice' },
      { word: 'Egg', th: 'ไข่', en: 'Egg' },
      { word: 'Milk', th: 'นม', en: 'Milk' },
      { word: 'Coffee', th: 'กาแฟ', en: 'Coffee' },
      { word: 'Fruit', th: 'ผลไม้', en: 'Fruit' },
      { word: 'Bread', th: 'ขนมปัง', en: 'Bread' },
      { word: 'Chicken', th: 'ไก่', en: 'Chicken (meat)' },
      { word: 'Tea', th: 'ชา', en: 'Tea' },
      { word: 'Sugar', th: 'น้ำตาล', en: 'Sugar' },
      { word: 'Orange juice', th: 'น้ำส้ม', en: 'Orange juice' }
    ],
  },
  {
    id: 4,
    icon: 'users',
    color: 'bg-sky-400',
    words: [
      { word: 'Father', th: 'พ่อ', en: 'Father' },
      { word: 'Mother', th: 'แม่', en: 'Mother' },
      { word: 'Brother', th: 'พี่ชาย / น้องชาย', en: 'Brother' },
      { word: 'Sister', th: 'พี่สาว / น้องสาว', en: 'Sister' },
      { word: 'Grandfather', th: 'ปู่ / ตา', en: 'Grandfather' },
      { word: 'Grandmother', th: 'ย่า / ยาย', en: 'Grandmother' },
      { word: 'Family', th: 'ครอบครัว', en: 'Family' },
      { word: 'Friend', th: 'เพื่อน', en: 'Friend' },
      { word: 'Son', th: 'ลูกชาย', en: 'Son' },
      { word: 'Daughter', th: 'ลูกสาว', en: 'Daughter' }
    ],
  },
  {
    id: 5,
    icon: 'plane',
    color: 'bg-indigo-300',
    words: [
      { word: 'Airport', th: 'สนามบิน', en: 'Airport' },
      { word: 'Car', th: 'รถยนต์', en: 'Car' },
      { word: 'Train', th: 'รถไฟ', en: 'Train' },
      { word: 'Boat', th: 'เรือ', en: 'Boat' },
      { word: 'Hotel', th: 'โรงแรม', en: 'Hotel' },
      { word: 'Beach', th: 'ชายหาด', en: 'Beach' },
      { word: 'Map', th: 'แผนที่', en: 'Map' },
      { word: 'Ticket', th: 'ตั๋ว', en: 'Ticket' },
      { word: 'Bus', th: 'รถเมล์', en: 'Bus' },
      { word: 'Market', th: 'ตลาด', en: 'Market' }
    ],
  },
];
