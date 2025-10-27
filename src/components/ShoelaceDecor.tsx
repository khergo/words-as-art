import shoelaceAccent from "@/assets/shoelace-accent.png";

const ShoelaceDecor = () => {
  return (
    <div className="fixed bottom-0 right-0 w-64 h-64 opacity-5 pointer-events-none z-0">
      <img
        src={shoelaceAccent}
        alt=""
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default ShoelaceDecor;
