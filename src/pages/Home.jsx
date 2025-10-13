import React from 'react'
import Hero from '../components/Hero'
import CoreModules from '../components/CoreModules';
import LatestProducts from '../components/LatestProducts';
import FAQ from '../components/FAQ';
import TestAuth from '../components/TestAuth';
const Home = () => {
  return (
    <>
    <Hero />
      {/* Core Modules Section */}
      <CoreModules />

      {/* Latest Products Section */}
      <LatestProducts />

      {/* FAQ Section */}
      <FAQ />
    </>
  )
}

export default Home