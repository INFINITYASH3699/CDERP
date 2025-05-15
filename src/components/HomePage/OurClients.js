import Image from "next/image";
import { useMemo } from "react";
import styles from "@/styles/HomePage/OurClients.module.css";

const clientLogos = [
  "airmeet.avif",
  "aruba.avif",
  "ask.avif",
  "bharatgri.avif",
  "bharatpe.avif",
  "capita.avif",
  "crisi.avif",
  "cummins.avif",
  "dream11.avif",
  "eatfit.avif",
  "exl.avif",
  "genius.avif",
  "godrej.avif",
  "hdfc.avif",
  "homelane.avif",
  "ibm.avif",
  "iss.avif",
  "jindal.avif",
  "john-deere.avif",
  "kelly.avif",
  "leapfinance.avif",
  "moneytap.avif",
  "monginis.avif",
  "paytm.avif",
  "pizza-hut.avif",
  "sharechat.avif",
  "swiggy.avif",
  "syntel.avif",
  "volkswagon.avif",
  "vyapar.avif",
  "weber.avif",
  "whitehat.avif",
  "zenser.avif",  
  "BAJAJ.avif",
  "BIG.avif",
  "BOSTON.avif",
  "CAP.avif",
  "FIRST.avif",
  "GNS.avif",
  "INTE.avif",
  "ZELI.avif",
  "DCT.avif",
  "NA.avif",
  "KOHLER.avif",
];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Marquee = ({ reverse = false, shuffle = false }) => {
  // Memoize the shuffled array to prevent re-shuffling on each render
  const logosToUse = useMemo(() => {
    return shuffle ? shuffleArray(clientLogos) : clientLogos;
  }, [shuffle]);

  return (
    <div
      className={`${styles.marquee} ${reverse ? styles.marqueeReverse : ""}`}
    >
      <div className={styles.marqueeContent}>
        {/* First set of logos */}
        {logosToUse.map((logo, index) => (
          <div key={`first-${index}`} className={styles.clientLogoContainer}>
            <Image
              src={`/Ourclients/${logo}`}
              alt={`Client ${index + 1}`}
              width={180}
              height={90}
              className={styles.clientLogo}
            />
          </div>
        ))}

        {/* Second set of logos for seamless looping */}
        {logosToUse.map((logo, index) => (
          <div key={`second-${index}`} className={styles.clientLogoContainer}>
            <Image
              src={`/Ourclients/${logo}`}
              alt={`Client ${index + 1}`}
              width={180}
              height={90}
              className={styles.clientLogo}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const OurClients = () => (
  <section className={styles.ourClientsSection}>
    <h2 className={styles.sectionTitle}>Our Clients</h2>
    <div className={styles.titleUnderline}></div>
    <div className={styles.marqueeContainer}>
      <Marquee shuffle={true} /> {/* Shuffled, normal direction */}
      <Marquee reverse /> {/* Original order, reversed direction */}
      <Marquee shuffle={true} /> {/* Shuffled, normal direction */}
    </div>
  </section>
);

export default OurClients;
