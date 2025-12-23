import React, { useEffect, useMemo, useRef } from "react";
import MainLayout from "./components/layout/MainLayout";
import Sidebar from "./components/layout/Sidebar";
import HempMap from "./components/charts/HempMap";
import SankeyChart from "./components/charts/SankeyChart";
import RadarChart from "./components/charts/RadarChart";
import ProposalsTable from "./components/charts/ProposalsTable";
import useChainStore from "./store/useChainStore";
import { COLORS } from "./constants/colors";

function App() {
  const {
    allChains,
    selectedMainId,
    selectedSubId1,
    selectedSubId2,
    sankeyFilter,
  } = useChainStore();

  const prevSankeyFilterRef = useRef(null);
  const prevMainIdRef = useRef(selectedMainId);

  const mainChain = useMemo(
    () => allChains.find((c) => c.id === selectedMainId),
    [allChains, selectedMainId]
  );
  useEffect(() => {
    prevMainIdRef.current = selectedMainId;
  }, [selectedMainId]);

  useEffect(() => {
    if (!sankeyFilter) {
      prevSankeyFilterRef.current = null;
      return;
    }

    const prevFilter = prevSankeyFilterRef.current;
    if (
      prevFilter &&
      prevFilter.sourceColumn === sankeyFilter.sourceColumn &&
      prevFilter.targetColumn === sankeyFilter.targetColumn &&
      prevFilter.sourceName === sankeyFilter.sourceName &&
      prevFilter.targetName === sankeyFilter.targetName
    ) {
      return;
    }

    prevSankeyFilterRef.current = sankeyFilter;

    const scrollContainer = document.getElementById("main-scroll-container");
    const proposalsSection = document.getElementById("proposals-section");
    if (!scrollContainer || !proposalsSection) return;

    setTimeout(() => {
      scrollContainer.scrollTo({ top: proposalsSection.offsetTop - 20, behavior: "smooth" });
    }, 100);
  }, [sankeyFilter]);

  return (
    <MainLayout leftSidebar={<Sidebar />}>
      <>
        <section
          className="w-full flex flex-col"
          style={{
            paddingTop: "51px",
            paddingLeft: "24px",
            paddingRight: "24px",
            paddingBottom: "24px",
            gap: "12px",
            minHeight: "100vh",
            boxSizing: "border-box",
          }}
        >
          <header
            id="dashboard-header"
            className="shrink-0 flex flex-col"
            style={{ gap: "1px", marginBottom: "24px" }}
          >
            <p className="text-body2-sb text-gray-400">
              Deeper Analysis on Blockchains
            </p>
            <h1 className="text-title2-sb text-gray-100">
              HEMP: Health Evaluation Metric using Proposals
            </h1>
          </header>

          <div
            className="flex w-full"
            style={{ gap: "12px", height: "294px" }}
          >
            <div
              className="h-full w-[52%] relative overflow-hidden rounded-2xl shadow-lg"
              style={{ backgroundColor: COLORS.GRAYBG }}
            >
              <div className="absolute inset-0">
                <HempMap />
              </div>
            </div>

            <div
              className="h-full w-[48%] relative overflow-hidden rounded-2xl shadow-lg"
              style={{ backgroundColor: COLORS.GRAYBG }}
            >
              <RadarChart />
            </div>
          </div>

          <div
            className="w-full flex-1 relative overflow-hidden rounded-2xl shadow-lg"
            style={{ backgroundColor: COLORS.GRAYBG, marginBottom: "12px", minHeight: "480px" }}
          >
            <SankeyChart />
          </div>
        </section>

        <section
          id="proposals-section"
          className="w-full"
          style={{
            paddingLeft: "24px",
            paddingRight: "24px",
            paddingBottom: "24px",
            boxSizing: "border-box",
          }}
        >
          <ProposalsTable mainChain={mainChain} />
        </section>
      </>
    </MainLayout>
  );
}

export default App;
