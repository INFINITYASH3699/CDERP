"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/AboutPage/Branches.module.css";
import { MapPin, Globe as GlobeIcon } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import with SSR disabled
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
});

const BRANCH_DATA = [
  {
    id: "pune",
    city: "Pune",
    address:
      "1st Floor, 101, Police, Wireless Colony, Vishal Nagar, Pimple Nilakh, Pune, Pimpri-Chinchwad, Maharashtra 411027",
    position: { lat: 18.588048051275003, lng: 73.78119014757031 },
    mapLink: "https://maps.app.goo.gl/DNwzKa2Yt1WB6zUB7",
    labelAltitude: 0.01,
    labelOffset: { lat: 0.1, lng: 0.1 },
  },
  {
    id: "mumbai",
    city: "Mumbai",
    address:
      "4th Floor, Ram Niwas, B-404, Gokhale Rd, near McDonald's, Dada Patil Wadi, Naupada, Thane West, Thane, Maharashtra 400602",
    position: { lat: 19.259055941077712, lng: 72.96564544031934 },
    mapLink: "https://maps.app.goo.gl/i7W3baVVS1mDLmTJ9",
    labelAltitude: 0.02,
    labelOffset: { lat: -0.1, lng: -0.1 },
  },
  {
    id: "raipur",
    city: "Raipur",
    address: "New Panchsheel Nagar, Civil Lines, Raipur, Chhattisgarh 492001",
    position: { lat: 21.23944689267376, lng: 81.65363342070017 },
    mapLink: "https://maps.app.goo.gl/1KA1uhcyoF5Tu4Mg6",
    labelAltitude: 0.03,
    labelOffset: { lat: 0, lng: 0 },
  },
];

const BranchCard = ({ branch, isActive, onHover }) => (
  <div
    className={`${styles.branchCard} ${isActive ? styles.activeBranch : ''}`}
    onMouseEnter={() => onHover(branch.id)}
    onMouseLeave={() => onHover(null)}
  >
    <div className={styles.branchCardBody}>
      <div className={styles.branchCardHeader}>
        <MapPin className={styles.branchIcon} />
        <h5 className={styles.branchTitle}>{branch.city}</h5>
      </div>
      <p className={styles.branchAddress}>{branch.address}</p>
      <a
        href={branch.mapLink}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.mapButton}
      >
        <GlobeIcon className={styles.mapButtonIcon} />
        View on Map
      </a>
    </div>
  </div>
);

const Branches = () => {
  const globeRef = useRef(null);
  const [activeBranch, setActiveBranch] = useState(null);
  const [globeRotation, setGlobeRotation] = useState(true);
  const [globeSize, setGlobeSize] = useState({ width: 500, height: 500 });
  const [isClient, setIsClient] = useState(false);

  // Set initial default values for SSR that won't cause issues
  useEffect(() => {
    // Mark that we're now on the client
    setIsClient(true);
    
    // Responsive globe size calculation
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      let width, height;

      if (windowWidth < 640) {
        // Mobile view
        width = 300;
        height = 300;
      } else if (windowWidth < 1024) {
        // Tablet view
        width = 500;
        height = 500;
      } else {
        // Desktop view
        width = 850;
        height = 850;
      }

      setGlobeSize({ width, height });
    };

    // Initial call
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const configureGlobe = () => {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = globeRotation;
        globeRef.current.controls().autoRotateSpeed = 0.6;
        globeRef.current.controls().enableZoom = false;
      }
    };

    configureGlobe();
  }, [globeRotation, isClient]);

  const handleBranchHover = (branchId) => {
    setActiveBranch(branchId);
    
    if (!isClient) return;
    
    if (branchId && globeRef.current) {
      // Stop rotation when a branch is hovered
      setGlobeRotation(false);
      
      // Find the hovered branch
      const branch = BRANCH_DATA.find(b => b.id === branchId);
      if (branch) {
        // Rotate to focus on the specific location
        globeRef.current.pointOfView(
          { 
            lat: branch.position.lat, 
            lng: branch.position.lng, 
            altitude: 2.5 
          }, 
          1000 // Transition duration in ms
        );
      }
    } else {
      // Resume rotation when no branch is hovered
      setGlobeRotation(true);
    }
  };

  // Move DOM manipulation to a client-side only function
  const createCustomMarker = (color = "#FF6B6B", isActive = false) => {
    if (!isClient) return null;
    
    const el = document.createElement("div");
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `;
    el.style.width = "24px";
    el.style.height = "24px";
    el.style.transform = "translate(-50%, -100%)";
    if (isActive) {
      el.style.animation = "pulse 1s infinite";
    }
    return el;
  };

  return (
    <div className={styles.branchesContainer}>
      <div className={styles.branchesWrapper}>
        <div className={styles.globeSection}>
          <div className={styles.globeWrapper}>
            {isClient && (
              <Globe
                ref={globeRef}
                width={globeSize.width}
                height={globeSize.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                backgroundColor="rgba(0,0,0,0)"
                labelsData={BRANCH_DATA}
                labelLat={(d) => d.position.lat + (d.labelOffset?.lat || 0)}
                labelLng={(d) => d.position.lng + (d.labelOffset?.lng || 0)}
                labelText={(d) => d.city}
                labelSize={1.5}
                labelColor={() => "white"}
                labelAltitude={(d) => d.labelAltitude}
                labelDotRadius={0}
                labelResolution={2}
                htmlElementsData={BRANCH_DATA}
                htmlElement={(d) =>
                  createCustomMarker(
                    d.id === activeBranch ? "#FF6B6B" : "#4CAF50",
                    d.id === activeBranch
                  )
                }
                htmlLat={(d) => d.position.lat}
                htmlLng={(d) => d.position.lng}
              />
            )}
          </div>
        </div>

        <div className={styles.branchListSection}>
          <h2 className={styles.sectionTitle}>
            Our Branches
          </h2>
          <div className={styles.branchCardContainer}>
            {BRANCH_DATA.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                isActive={branch.id === activeBranch}
                onHover={handleBranchHover}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branches;