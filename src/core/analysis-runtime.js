const benchmarkTimes = {
  LoadSaveFile: { name: "LoadSaveFile()", timeStart: 0, timeEnd: 0 },
  CheckCompletion: { name: "HKCheckCompletion()", timeStart: 0, timeEnd: 0 },
  HKReadTextArea: { name: "HKReadTextArea()", timeStart: 0, timeEnd: 0 },
  Total: { name: "Total", timeStart: 0, timeEnd: 0 }
};

function Benchmark(benchmarks) {
  Object.values(benchmarks).forEach(benchmark => {
    if (benchmark.timeStart !== 0 && benchmark.timeEnd !== 0) {
      const duration = benchmark.timeEnd - benchmark.timeStart;
      console.info(`${benchmark.name} time (ms) = ${duration.toFixed(2)}`);
    }
    benchmark.timeStart = 0;
    benchmark.timeEnd = 0;
  });
}

export { Benchmark, benchmarkTimes };
