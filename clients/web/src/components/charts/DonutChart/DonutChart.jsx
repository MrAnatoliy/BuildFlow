import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";

const DonutChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);

    root.interfaceSetDirty = false;
    root._logo?.dispose();

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.horizontalLayout,
      })
    );

    const data = [
      { country: "France", sales: 100000 },
      { country: "Spain", sales: 160000 },
      { country: "United Kingdom", sales: 80000 },
      { country: "Netherlands", sales: 90000 },
      { country: "Portugal", sales: 25000 },
      { country: "Germany", sales: 70000 },
      { country: "Austria", sales: 75000 },
      { country: "Belgium", sales: 40000 },
      { country: "Poland", sales: 60000 },
    ];

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: "Sales",
        valueField: "sales",
        categoryField: "country",
        legendLabelText: "[{fill}]{category}[/]",
        legendValueText: "[bold {fill}]{value}[/]",
        maskBullets: false,
      })
    );
    series.data.setAll(data);
    series.labels.template.set("forceHidden", true);
    series.ticks.template.set("forceHidden", true);

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerY: am5.percent(50),
        y: am5.percent(50),
        layout: root.verticalLayout,
      })
    );
    legend.data.setAll(series.dataItems);

    series.appear(0, 0);
    chart.appear(0, 0);

    return () => root.dispose();
  }, []);

  return (
    <div className="w-full h-full" ref={chartRef}/>
  );
};

export default DonutChart;