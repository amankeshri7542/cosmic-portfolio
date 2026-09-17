import { ImageResponse } from "next/og";
import SocialImage from "@/components/SocialImage";
export const alt = "Aman Kumar — Full-stack Software Engineer";
export const size = {width:1200,height:630};
export const contentType = "image/png";
export default function Image() { return new ImageResponse(<SocialImage title="From the interface to the infrastructure." />, size); }
