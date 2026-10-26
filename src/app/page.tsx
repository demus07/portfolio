import { Loader } from "@/components/Loader";
import { Nav } from "@/components/Nav";
import { ActionBar } from "@/components/ActionBar";
import { Opening } from "@/components/Opening";
import { ContourRun } from "@/components/ContourRun";

// The landing, then the body: one route drawn through a contour map, section by section.
export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <Opening />
      <ContourRun />
      <ActionBar />
    </>
  );
}
