import logo from "@/assets/logo.png";

export default function Logo({ className = "h-10", alt = "Logo" }) {
  return <img src={logo} alt={alt} className={className} />;
}
