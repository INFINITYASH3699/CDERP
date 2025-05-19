import { notFound } from "next/navigation";
import CityCoursePage from "@/components/CitySitemap/CityCoursePage";
import Breadcrumb from "@/components/CitySitemap/Breadcrumb";

// This data would ideally come from your CMS or API
const cityData = {
  pune: {
    name: "Pune",
    description:
      "Explore our comprehensive range of professional courses in Pune, Maharashtra's educational hub and IT powerhouse.",
  },
  katraj: {
    name: "Katraj",
    description:
      "Join top-rated training programs in Katraj, a vibrant residential and educational area in south Pune with excellent connectivity.",
  },
  "pimpri-chinchwad": {
    name: "Pimpri-Chinchwad",
    description:
      "Enhance your career with specialized courses in Pimpri-Chinchwad, Pune's industrial township known for manufacturing and IT sectors.",
  },
  "shivaji-nagar": {
    name: "Shivaji Nagar",
    description:
      "Discover premium courses in Shivaji Nagar, a central commercial and educational hub in Pune with prestigious institutions.",
  },
  "koregaon-park": {
    name: "Koregaon Park",
    description:
      "Advance your skills with elite training programs in Koregaon Park, Pune's upscale neighborhood known for cosmopolitan culture.",
  },
  "viman-nagar": {
    name: "Viman Nagar",
    description:
      "Upgrade your professional expertise with courses in Viman Nagar, a modern residential and commercial district in east Pune.",
  },
  "pimple-saudagar": {
    name: "Pimple Saudagar",
    description:
      "Access quality training in Pimple Saudagar, a rapidly developing residential area with modern amenities and connectivity.",
  },
  baner: {
    name: "Baner",
    description:
      "Pursue professional development in Baner, one of Pune's premium IT corridors with excellent infrastructure and amenities.",
  },
  hinjewadi: {
    name: "Hinjewadi",
    description:
      "Gain industry-relevant skills in Hinjewadi, Pune's premier IT hub and home to numerous tech companies and business parks.",
  },
  wakad: {
    name: "Wakad",
    description:
      "Find comprehensive courses in Wakad, a thriving residential and commercial area close to Pune's IT hubs and business centers.",
  },
  kothrud: {
    name: "Kothrud",
    description:
      "Enroll in top-rated programs in Kothrud, one of Pune's most developed residential areas with excellent educational infrastructure.",
  },
  hadapsar: {
    name: "Hadapsar",
    description:
      "Develop your professional capabilities in Hadapsar, a major commercial and industrial zone in eastern Pune.",
  },
  aundh: {
    name: "Aundh",
    description:
      "Excel with specialized training in Aundh, an upscale residential neighborhood in Pune known for its modern amenities and vibrant culture.",
  },
  mumbai: {
    name: "Mumbai",
    description:
      "Discover top-rated professional training programs in Mumbai, India's financial capital and business hub.",
  },
  "navi-mumbai": {
    name: "Navi Mumbai",
    description:
      "Explore career-boosting courses in Navi Mumbai, a well-planned satellite city with booming IT and commercial sectors.",
  },
  thane: {
    name: "Thane",
    description:
      "Advance your skills in Thane, a fast-growing city near Mumbai known for its vibrant job market and infrastructure.",
  },
  kalyan: {
    name: "Kalyan",
    description:
      "Discover specialized training in Kalyan, a key residential and commercial hub in the Mumbai Metropolitan Region.",
  },
  bandra: {
    name: "Bandra",
    description:
      "Upgrade your expertise in Bandra, Mumbai’s trendy suburb known for its business centers and cultural hotspots.",
  },
  andheri: {
    name: "Andheri",
    description:
      "Gain industry-relevant knowledge in Andheri, Mumbai's major business district with diverse corporate opportunities.",
  },
  powai: {
    name: "Powai",
    description:
      "Join professional courses in Powai, a leading educational and startup hub in Mumbai with a strong corporate presence.",
  },
  worli: {
    name: "Worli",
    description:
      "Develop your career in Worli, one of Mumbai’s prime commercial districts with elite business and educational centers.",
  },
  chembur: {
    name: "Chembur",
    description:
      "Find top-rated training in Chembur, a well-connected residential and industrial area in Mumbai.",
  },
  malad: {
    name: "Malad",
    description:
      "Advance your skills with specialized courses in Malad, a dynamic residential and IT hub in Mumbai’s western suburbs.",
  },
  "vile-parle": {
    name: "Vile Parle",
    description:
      "Enroll in professional training in Vile Parle, home to top educational institutions and business districts.",
  },
  matunga: {
    name: "Matunga",
    description:
      "Excel in your field with expert training in Matunga, Mumbai’s academic and cultural hub.",
  },
  delhi: {
    name: "Delhi",
    description:
      "Enhance your skills with professional courses in Delhi, India's capital city and a center for diverse industries.",
  },
  kolkata: {
    name: "Kolkata",
    description:
      "Discover professional courses in Kolkata, Eastern India's educational and cultural hub with rich heritage.",
  },
  chennai: {
    name: "Chennai",
    description:
      "Find specialized training programs in Chennai, a major educational and industrial center in South India.",
  },
  bangalore: {
    name: "Bangalore",
    description:
      "Advance your career with specialized courses in Bangalore, India's technology hub and startup capital.",
  },
  hyderabad: {
    name: "Hyderabad",
    description:
      "Pursue quality professional training in Hyderabad, a major tech and educational center with growing opportunities.",
  },
  ahmedabad: {
    name: "Ahmedabad",
    description:
      "Enhance your career with quality training programs in Ahmedabad, Gujarat's largest city and industrial powerhouse.",
  },
  jaipur: {
    name: "Jaipur",
    description:
      "Get trained in top professional courses in Jaipur, Rajasthan's capital and a growing business center.",
  },
  lucknow: {
    name: "Lucknow",
    description:
      "Discover professional development opportunities in Lucknow, known for its heritage, culture, and education.",
  },
  kanpur: {
    name: "Kanpur",
    description:
      "Advance your skills with professional courses in Kanpur, an important industrial and educational center in North India.",
  },
  nagpur: {
    name: "Nagpur",
    description:
      "Find quality training programs in Nagpur, the geographical center of India and an emerging commercial hub.",
  },
  patna: {
    name: "Patna",
    description:
      "Explore career-advancing courses in Patna, Bihar's capital and a rapidly developing educational center.",
  },
  indore: {
    name: "Indore",
    description:
      "Expand your professional capabilities in Indore, Madhya Pradesh's commercial capital and cleanest city in India.",
  },
  bhopal: {
    name: "Bhopal",
    description:
      "Learn from industry experts in Bhopal, the capital city of Madhya Pradesh with a blend of modern development and natural beauty.",
  },
  visakhapatnam: {
    name: "Visakhapatnam",
    description:
      "Gain valuable skills with professional courses in Visakhapatnam, a major port city and industrial center on the east coast.",
  },
  vadodara: {
    name: "Vadodara",
    description:
      "Enhance your professional profile with quality training in Vadodara, an educational and industrial center in Gujarat.",
  },
  ludhiana: {
    name: "Ludhiana",
    description:
      "Upgrade your skills with professional courses in Ludhiana, Punjab's largest city and manufacturing hub.",
  },
  agra: {
    name: "Agra",
    description:
      "Discover practical training programs in Agra, home to world-renowned heritage sites and a growing educational sector.",
  },
  nashik: {
    name: "Nashik",
    description:
      "Develop your career with professional courses in Nashik, an emerging educational hub and wine capital of India.",
  },
  rajkot: {
    name: "Rajkot",
    description:
      "Explore quality training programs in Rajkot, one of Gujarat's fastest-growing cities with a strong industrial base.",
  },
  varanasi: {
    name: "Varanasi",
    description:
      "Find specialized courses in Varanasi, one of the world's oldest continuously inhabited cities with rich educational heritage.",
  },
  kerala: {
    name: "Kerala",
    description:
      "Advance your skills with professional training across Kerala, known for its high literacy rate and quality education.",
  },
  surat: {
    name: "Surat",
    description:
      "Gain valuable expertise in Surat, Gujarat's commercial powerhouse and diamond cutting center with growing IT sectors.",
  },
  dehradun: {
    name: "Dehradun",
    description:
      "Discover quality education in Dehradun, Uttarakhand's capital known for prestigious institutions and natural beauty.",
  },
  madurai: {
    name: "Madurai",
    description:
      "Explore professional development opportunities in Madurai, one of Tamil Nadu's major cities with rich cultural heritage.",
  },
  mysore: {
    name: "Mysore",
    description:
      "Enhance your skills in Mysore, a city known for its cultural and educational heritage with growing IT presence.",
  },
  pondicherry: {
    name: "Pondicherry",
    description:
      "Find specialized courses in Pondicherry, a unique cultural and educational destination with French colonial influence.",
  },
  ranchi: {
    name: "Ranchi",
    description:
      "Advance your career with professional training in Ranchi, Jharkhand's capital city with expanding educational opportunities.",
  },
  coimbatore: {
    name: "Coimbatore",
    description:
      "Develop your expertise in Coimbatore, a major educational and industrial hub in Tamil Nadu known as Manchester of South India.",
  },
  chandigarh: {
    name: "Chandigarh",
    description:
      "Explore quality professional courses in Chandigarh, a well-planned city with excellent infrastructure and educational facilities.",
  },
  bhubaneswar: {
    name: "Bhubaneswar",
    description:
      "Gain valuable skills in Bhubaneswar, Odisha's capital and a growing IT hub with rich cultural heritage.",
  },
  tirupati: {
    name: "Tirupati",
    description:
      "Find professional training opportunities in Tirupati, a prominent educational and spiritual center in Andhra Pradesh.",
  },
  vizag: {
    name: "Vizag",
    description:
      "Enhance your professional qualifications in Vizag, a major port city on the east coast with growing industrial sectors.",
  },
  trivandrum: {
    name: "Trivandrum",
    description:
      "Develop your career with quality courses in Trivandrum, Kerala's capital and an emerging IT and space research hub.",
  },
  jalandhar: {
    name: "Jalandhar",
    description:
      "Upgrade your skills with professional training in Jalandhar, one of Punjab's major industrial cities with sports goods manufacturing.",
  },
  mohali: {
    name: "Mohali",
    description:
      "Explore specialized courses in Mohali, an emerging IT, educational hub, and cricket venue in Punjab.",
  },
  raipur: {
    name: "Raipur",
    description:
      "Find quality professional training in Raipur, the capital city of Chhattisgarh with growing industrial and educational sectors.",
  },
  cochin: {
    name: "Cochin",
    description:
      "Advance your career with courses in Cochin, Kerala's major port city and commercial hub with rich cultural diversity.",
  },
  mangalore: {
    name: "Mangalore",
    description:
      "Gain professional expertise in Mangalore, a major port city and educational center in Karnataka with diverse industries.",
  },
};

export async function generateMetadata({ params }) {
  const city = params.city.toLowerCase();

  if (!cityData[city]) {
    return {
      title: "City Not Found",
      description: "The requested city page could not be found.",
    };
  }

  return {
    title: `Courses in ${cityData[city].name} | Connecting Dots ERP`,
    description: cityData[city].description,
    keywords: `courses in ${cityData[city].name}, SAP training ${cityData[city].name}, IT courses ${cityData[city].name}, professional training ${cityData[city].name}, best training institute in ${cityData[city].name}`,
  };
}

export default function CityPage({ params }) {
  const city = params.city.toLowerCase();

  // Check if the city exists in our data
  if (!cityData[city]) {
    notFound();
  }

  const cityInfo = cityData[city];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Sitemap", path: "/sitemap" },
    { label: cityInfo.name },
  ];

  return (
    <main>
      <Breadcrumb items={breadcrumbItems} />
      <CityCoursePage city={city} cityInfo={cityData[city]} />
    </main>
  );
}
