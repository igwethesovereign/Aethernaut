'use client';

export function DeployInfo() {
  return (
    <div className="bg-[#1A1A24]/50 border border-[#D4AF37]/10 rounded-lg p-4 mb-8">
      <h4 className="text-sm font-semibold text-[#D4AF37] mb-2">Devnet Deployment</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <span className="text-gray-500">Treasury:</span>
          <span className="text-[#D4AF37]/70 ml-2 break-all">
            BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7
          </span>
        </div>
        <div>
          <span className="text-gray-500">Agent Registry:</span>
          <span className="text-[#D4AF37]/70 ml-2 break-all">
            2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq
          </span>
        </div>
        <div>
          <span className="text-gray-500">Prediction Market:</span>
          <span className="text-[#D4AF37]/70 ml-2 break-all">
            FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX
          </span>
        </div>
      </div>
    </div>
  );
}
