import { Loader } from "@/components/Loader";
import { Nav } from "@/components/Nav";
import { ActionBar } from "@/components/ActionBar";
import { Opening } from "@/components/Opening";
import { ContourRun } from "@/components/ContourRun";
import { Night } from "@/components/Night";

// The landing, the body (one route drawn through a contour map), and back to the sea wall.
export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <Opening />
      <ContourRun />
      <Night />
      <ActionBar />
    </>
  );
}
