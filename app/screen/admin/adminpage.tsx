import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import PageA from './user/user';
import PageB from './product/product';
// import PageC from './transaction/transaction';
import PageC from './staff/staff';

const screenWidth = Dimensions.get('window').width;

export default function AdminPage() {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: screenWidth, animated: false });
    }, 100); // kasih waktu biar layout selesai

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
    >
      <PageA />
      <PageB />
      <PageC />
    </ScrollView>
  );
}