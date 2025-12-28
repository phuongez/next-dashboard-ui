const Annoucement = () => {
  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Annoucements</h1>
        <span className="text-xs text-gray-400">View all</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-lamaSkyLight p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Tin hoạt động ngoại khoá</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-01-01
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Hoạt động ngoại khoá cuối tuần qua đã diễn ra với tinh thần xây
            dựng, gắn kết
          </p>
        </div>
        <div className="bg-lamaPurpleLight p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Tin hoạt động ngoại khoá</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-01-01
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Hoạt động ngoại khoá cuối tuần qua đã diễn ra với tinh thần xây
            dựng, gắn kết
          </p>
        </div>
        <div className="bg-lamaYellowLight p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Tin hoạt động ngoại khoá</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-01-01
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Hoạt động ngoại khoá cuối tuần qua đã diễn ra với tinh thần xây
            dựng, gắn kết
          </p>
        </div>
      </div>
    </div>
  );
};

export default Annoucement;
