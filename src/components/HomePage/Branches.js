"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Building,
  Map,
} from "lucide-react";

const branches = [
  {
    city: "Pune",
    headline: "Headquarters Office",
    phone: "+91 90040 02941",
    hours: "Mon-Sun: All hours",
    address:
      "1st Floor,101, Police, Wireless Colony, Vishal Nagar, Pimple Nilakh, Pune, Pimpri-Chinchwad, Maharashtra 411027",
    position: { lat: 18.588048051275003, lng: 73.78119014757031 },
    mapLink: "https://maps.app.goo.gl/DNwzKa2Yt1WB6zUB7",
    color: "#3b82f6", // Blue
    image: "/branches/Pune-Cover-Photo.png",
  },
  {
    city: "Mumbai",
    headline: "Office",
    phone: "+91 90040 01938",
    hours: "Mon-Sun: All hours",
    address:
      "4th Floor, Ram Niwas, B-404, Gokhale Rd, near McDonald's, Dada Patil Wadi, Naupada, Thane West, Thane, Maharashtra 400602",
    position: { lat: 19.259055941077712, lng: 72.96564544031934 },
    mapLink: "https://maps.app.goo.gl/i7W3baVVS1mDLmTJ9",
    color: "#10b981", // Green
    image: "/branches/Mumbai-Cover-Photo.png",
  },
  {
    city: "Raipur",
    headline: "Office",
    phone: "+91 89560 01555",
    hours: "Mon-Sun: All hours",
    address: "New Panchsheel Nagar, Civil Lines, Raipur, Chhattisgarh 492001",
    position: { lat: 21.23944689267376, lng: 81.65363342070017 },
    mapLink: "https://maps.app.goo.gl/1KA1uhcyoF5Tu4Mg6",
    color: "#f97316", // Orange
    image: "/branches/Raipur-Cover-Photo.png",
  },
];

const BranchesComponent = () => {
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeView, setActiveView] = useState("cards"); // Changed default to "cards"
  const [animationDirection, setAnimationDirection] = useState(null);
  const sliderRef = useRef(null);
  const mapRef = useRef(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  // Load Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDBGFl3pJw6rBm6R0eX5vPZNLVkZgfcvh8",
  });

  // Handle window resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Animate branch change
  const changeBranch = (index, direction) => {
    setAnimationDirection(direction);
    setTimeout(() => {
      setSelectedBranch(index);
      setAnimationDirection(null);
    }, 300);

    // Animate map if it's loaded
    if (mapRef.current && mapLoaded) {
      mapRef.current.panTo(branches[index].position);
      mapRef.current.setZoom(15);
    }
  };

  // Get next branch index
  const getNextBranch = () => {
    return (selectedBranch + 1) % branches.length;
  };

  // Get previous branch index
  const getPrevBranch = () => {
    return (selectedBranch - 1 + branches.length) % branches.length;
  };

  // Map container style - reduced height by ~40%
  const mapContainerStyle = {
    width: "100%",
    height: "100%",
    minHeight: windowSize.width <= 768 ? "200px" : "300px", // Reduced from 300px/500px
    borderRadius: "16px",
  };

  // Map options
  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [{ color: "#d3d3d3" }],
      },
      {
        featureType: "transit",
        stylers: [{ color: "#808080" }, { visibility: "off" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ visibility: "on" }, { color: "#b3b3b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "road.local",
        elementType: "geometry.fill",
        stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 1.8 }],
      },
      {
        featureType: "road.local",
        elementType: "geometry.stroke",
        stylers: [{ color: "#d7d7d7" }],
      },
      {
        featureType: "poi",
        elementType: "geometry.fill",
        stylers: [{ visibility: "on" }, { color: "#ebebeb" }],
      },
      {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [{ color: "#a7a7a7" }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "landscape",
        elementType: "geometry.fill",
        stylers: [{ visibility: "on" }, { color: "#efefef" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#696969" }],
      },
      {
        featureType: "administrative",
        elementType: "labels.text.fill",
        stylers: [{ visibility: "on" }, { color: "#737373" }],
      },
      {
        featureType: "poi",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry.stroke",
        stylers: [{ color: "#d6d6d6" }],
      },
      {
        featureType: "road",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi",
        elementType: "geometry.fill",
        stylers: [{ color: "#dadada" }],
      },
    ],
  };

  // Custom SVG path for location marker
  const customMarkerSvg = {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: "#ff0000",
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: "#ffffff",
    scale: 1.5,
    anchor: { x: 12, y: 23 },
  };

  // Loading state UI
  if (!isLoaded)
    return (
      <div className="flex justify-center items-center min-h-40 w-full">
        {" "}
        {/* Reduced height */}
        <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-blue-400 h-10 w-10"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-3 bg-blue-400 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-blue-400 rounded"></div>
                <div className="h-3 bg-blue-400 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <p className="text-center mt-3 text-white font-medium">
            Loading Map...
          </p>
        </div>
      </div>
    );

  return (
    <div className="py-4 mb-8 px-4 md:px-6">
      {" "}
      {/* Reduced padding */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section - compact version */}
        <div className="text-center mb-8">
          {" "}
          {/* Reduced margin */}
          {/* Custom title styling */}
          <h2 className="branchesTitle mb-4">
            {" "}
            {/* Added custom class */}
            Find Us Across India
          </h2>
          {/* View Toggle - more compact */}
          <div className="flex justify-center mt-4 mb-6">
            {" "}
            {/* Reduced margins */}
            <div className="bg-white rounded-full p-1 shadow-md inline-flex">
              <button
                onClick={() => setActiveView("map")}
                className={`px-4 py-1 rounded-full flex items-center gap-2 text-xs font-medium transition ${
                  activeView === "map"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Map size={14} />
                Map View
              </button>
              <button
                onClick={() => setActiveView("cards")}
                className={`px-4 py-1 rounded-full flex items-center gap-2 text-xs font-medium transition ${
                  activeView === "cards"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Building size={14} />
                Card View
              </button>
            </div>
          </div>
        </div>

        {/* Map View - with integrated city tabs */}
        {activeView === "map" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Map Container with integrated city tabs */}
            <div className="lg:col-span-8 h-[320px] md:h-[390px] relative overflow-hidden rounded-xl shadow-lg border border-gray-200">
              {/* City Navigation Tabs - MOVED INSIDE MAP CONTAINER */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-b-lg flex justify-center lg:justify-end items-center gap-1 border-b border-gray-200">
                {branches.map((branch, index) => (
                  <button
                    key={`city-tab-${index}`}
                    onClick={() =>
                      changeBranch(
                        index,
                        index > selectedBranch ? "right" : "left"
                      )
                    }
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 flex items-center ${
                      selectedBranch === index
                        ? "text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                    style={{
                      backgroundColor:
                        selectedBranch === index ? branch.color : "",
                      border: `1px solid ${selectedBranch === index ? branch.color : "#e5e7eb"}`,
                    }}
                  >
                    <MapPin
                      size={12}
                      className={`mr-1 ${selectedBranch === index ? "animate-pulse" : ""}`}
                    />
                    {branch.city}
                  </button>
                ))}
              </div>

              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={branches[selectedBranch].position}
                  zoom={15}
                  options={mapOptions}
                  onLoad={(map) => {
                    setMapLoaded(true);
                    mapRef.current = map;
                  }}
                >
                  {branches.map((branch, index) => (
                    <Marker
                      key={index}
                      position={branch.position}
                      onClick={() =>
                        changeBranch(
                          index,
                          index > selectedBranch ? "right" : "left"
                        )
                      }
                      animation={
                        mapLoaded ? window.google?.maps.Animation.DROP : null
                      }
                      icon={{
                        ...customMarkerSvg,
                        fillColor:
                          selectedBranch === index ? branch.color : "#909090",
                        scale: selectedBranch === index ? 2.0 : 1.3,
                      }}
                    />
                  ))}
                </GoogleMap>
              )}

              {/* Location Indicator - moved to bottom-left for better layout with tabs */}
              <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-2 animate-pulse"
                    style={{
                      backgroundColor: `${branches[selectedBranch].color}20`,
                    }}
                  >
                    <MapPin size={16} color={branches[selectedBranch].color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-800">
                      {branches[selectedBranch].city}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {branches[selectedBranch].headline}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Branch Info Card - more compact */}
            <div className="lg:col-span-4">
              <div
                className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-full relative transition-all duration-300 transform ${
                  animationDirection === "left"
                    ? "-translate-x-full opacity-0"
                    : animationDirection === "right"
                      ? "translate-x-full opacity-0"
                      : "translate-x-0"
                }`}
              >
                {/* Branch Image - shorter */}
                <div className="h-32 relative overflow-hidden">
                  {" "}
                  {/* Reduced height */}
                  <Image
                    src={branches[selectedBranch].image}
                    alt={`${branches[selectedBranch].city} Office`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-700 hover:scale-110"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)`,
                    }}
                  ></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    {" "}
                    {/* Adjusted position */}
                    <h3 className="text-xl font-bold">
                      {branches[selectedBranch].city}
                    </h3>{" "}
                    {/* Smaller text */}
                    <p className="text-xs opacity-90">
                      {branches[selectedBranch].headline}
                    </p>
                  </div>
                  {/* Location badge */}
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                    style={{ backgroundColor: branches[selectedBranch].color }}
                  >
                    <MapPin size={10} className="inline mr-1" /> Location{" "}
                    {selectedBranch + 1}/{branches.length}
                  </div>
                </div>

                {/* Branch Details - more compact */}
                <div className="p-4">
                  {" "}
                  {/* Reduced padding */}
                  {/* Contact Info */}
                  <div className="flex flex-col gap-3 mb-4">
                    {" "}
                    {/* Reduced spacing */}
                    <div className="flex items-start">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                        style={{
                          backgroundColor: `${branches[selectedBranch].color}15`,
                        }}
                      >
                        <MapPin
                          size={12}
                          color={branches[selectedBranch].color}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-0.5">
                          ADDRESS
                        </p>
                        <p className="text-xs text-gray-700">
                          {branches[selectedBranch].address}
                        </p>{" "}
                        {/* Smaller text */}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                        style={{
                          backgroundColor: `${branches[selectedBranch].color}15`,
                        }}
                      >
                        <Phone
                          size={12}
                          color={branches[selectedBranch].color}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-0.5">
                          PHONE
                        </p>
                        <a
                          href={`tel:${branches[selectedBranch].phone}`}
                          className="text-xs text-gray-700 no-underline hover:underline"
                        >
                          {branches[selectedBranch].phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                        style={{
                          backgroundColor: `${branches[selectedBranch].color}15`,
                        }}
                      >
                        <Clock
                          size={12}
                          color={branches[selectedBranch].color}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-0.5">
                          WORKING HOURS
                        </p>
                        <p className="text-xs text-gray-700">
                          {branches[selectedBranch].hours}
                        </p>{" "}
                        {/* Smaller text */}
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {" "}
                    {/* Reduced gap */}
                    <a
                      href={branches[selectedBranch].mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg text-xs transition"
                    >
                      <Navigation size={14} className="mr-1" /> Get Directions
                    </a>
                    <a
                      href={`tel:${branches[selectedBranch].phone.replace(/\s+/g, "")}`}
                      className="no-underline flex items-center justify-center text-white font-medium py-2 px-3 rounded-lg text-xs transition"
                      style={{
                        backgroundColor: branches[selectedBranch].color,
                      }}
                    >
                      <Phone size={14} className="mr-1" /> Call Now
                    </a>
                  </div>
                </div>

                {/* Navigation Controls - keeping them as a fallback but also adding quick jumps */}
                <div className="flex justify-between p-3 border-t border-gray-100">
                  {" "}
                  {/* Reduced padding */}
                  <button
                    onClick={() => changeBranch(getPrevBranch(), "left")}
                    className="flex items-center text-gray-600 hover:text-gray-900 text-xs font-medium transition"
                  >
                    <ChevronLeft size={16} className="mr-1" /> Previous
                  </button>
                  <div className="flex space-x-1">
                    {branches.map((branch, index) => (
                      <button
                        key={`quick-jump-${index}`}
                        onClick={() =>
                          changeBranch(
                            index,
                            index > selectedBranch ? "right" : "left"
                          )
                        }
                        className={`w-2 h-2 rounded-full transition-all duration-300`}
                        style={{
                          backgroundColor:
                            selectedBranch === index ? branch.color : "#d1d5db",
                          transform:
                            selectedBranch === index
                              ? "scale(1.5)"
                              : "scale(1)",
                        }}
                        aria-label={`Jump to ${branch.city}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => changeBranch(getNextBranch(), "right")}
                    className="flex items-center text-gray-600 hover:text-gray-900 text-xs font-medium transition"
                  >
                    Next <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card View - more compact with reduced heights */}
        {activeView === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {" "}
            {/* Reduced gap */}
            {branches.map((branch, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Card Image with Map Preview - shorter */}
                <div className="h-36 relative overflow-hidden">
                  {" "}
                  {/* Reduced height */}
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={branch.position}
                      zoom={13}
                      options={{
                        ...mapOptions,
                        draggable: false,
                        zoomControl: false,
                        scrollwheel: false,
                        disableDoubleClickZoom: true,
                      }}
                    >
                      <Marker
                        position={branch.position}
                        icon={{
                          ...customMarkerSvg,
                          fillColor: branch.color,
                          scale: 1.7,
                        }}
                      />
                    </GoogleMap>
                  )}
                  {/* Overlay and Title */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-3 group-hover:from-black/90 transition-all duration-300">
                    {" "}
                    {/* Reduced padding */}
                    <div
                      className="inline-block px-2 py-0.5 rounded-full text-white text-xs font-semibold self-start mb-1"
                      style={{ backgroundColor: branch.color }}
                    >
                      {branch.headline}
                    </div>
                    <h3 className="text-white text-lg font-bold">
                      {branch.city}
                    </h3>
                  </div>
                  {/* View Full Map Button - appears on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <button
                      className="bg-white text-gray-800 hover:bg-gray-100 font-medium px-3 py-1 rounded-lg shadow-md flex items-center text-xs"
                      onClick={() => {
                        setSelectedBranch(index);
                        setActiveView("map");
                      }}
                    >
                      <Map size={14} className="mr-1" />
                      View on Map
                    </button>
                  </div>
                </div>

                {/* Card Content - more compact */}
                <div className="p-4">
                  {" "}
                  {/* Reduced padding */}
                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {" "}
                    {/* Reduced spacing */}
                    <div className="flex items-start">
                      <MapPin size={14} className="mr-2 mt-0.5 text-gray-500" />
                      <p className="text-gray-700 text-xs">
                        {branch.address}
                      </p>{" "}
                      {/* Smaller text */}
                    </div>
                    <div className="flex items-center">
                      <Phone size={14} className="mr-2 text-gray-500" />
                      <a
                        href={`tel:${branch.phone}`}
                        className="text-gray-700 my-2 text-xs no-underline hover:underline"
                      >
                        {branch.phone}
                      </a>
                    </div>
                    <div className="flex">
                      <Clock size={14} className="mr-2 text-gray-500" />
                      <p className="text-gray-700 text-xs">
                        {branch.hours}
                      </p>{" "}
                      {/* Smaller text */}
                    </div>
                  </div>
                  {/* Action Button */}
                  <a
                    href={branch.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full text-white font-medium py-2 px-3 rounded-lg text-xs transition-all duration-300 hover:scale-105 no-underline"
                    style={{ backgroundColor: branch.color }}
                  >
                    <Navigation size={14} className="mr-1" /> Get Directions{" "}
                    <ArrowUpRight size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Branch Indicator Pills - Mobile Only */}
        <div className="lg:hidden flex justify-center mt-6">
          {" "}
          {/* Reduced margin */}
          <div className="flex gap-2">
            {branches.map((branch, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() =>
                  changeBranch(index, index > selectedBranch ? "right" : "left")
                }
                className={`w-2 h-2 rounded-full transition-all duration-300 transform ${
                  selectedBranch === index ? "scale-125" : "bg-gray-300"
                }`}
                style={{
                  backgroundColor:
                    selectedBranch === index ? branch.color : undefined,
                }}
                aria-label={`Select ${branch.city} branch`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Custom CSS for the title styling */}
      <style jsx global>{`
        .branchesTitle {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: 4px;
          text-shadow:
            0 0 0px #fff,
            0 0 10px #fff,
            0 0 10px #0073e6,
            0 0 20px #182e4a,
            0 0 20px #182e4a,
            0 0 30px #182e4a,
            0 0 30px #182e4a;
          background: linear-gradient(
            90deg,
            #fff 35%,
            rgba(3, 163, 196, 1) 49%,
            #fff 62%
          );
          -webkit-background-clip: text;
          color: transparent;
          text-align: center;
        }

        @media (max-width: 768px) {
          .branchesTitle {
            font-size: 2rem;
            letter-spacing: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default BranchesComponent;
