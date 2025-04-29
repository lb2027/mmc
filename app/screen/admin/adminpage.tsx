import React, { useEffect, useRef } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import PageA from './a';
import PageB from './product/product';
import PageC from './c';

const screenWidth = Dimensions.get('window').width;

export default function AdminPage() {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: screenWidth, animated: false });
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
