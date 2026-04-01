import { Colors } from "../assets";

type UserIconProps = {
  fill: string;
  size: number;
};

function UserIcon(props: UserIconProps) {
  const { fill, size } = props;
  return (
    <svg
      width={size}
      height={size}
      version="1.1"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m256 0c-141.76 0-256 114.24-256 256s114.24 256 256 256 256-114.24 256-256-114.24-256-256-256zm-92.215 293.16h13.762c22.023 15.141 49.547 23.398 78.453 23.398 28.902 0 56.43-8.2578 78.453-23.398h13.762c35.785 0 67.441 20.645 81.203 50.926-31.656 63.312-97.719 105.98-173.42 105.98s-141.76-42.668-173.42-105.98c13.762-30.281 45.418-50.926 81.203-50.926zm92.215-209.2c50.926 0 92.215 39.914 92.215 90.84s-41.289 92.215-92.215 92.215-92.215-41.289-92.215-92.215 41.289-90.84 92.215-90.84z"
        fill={fill} // Aquí es donde hacemos que el color de relleno sea dinámico
      />
    </svg>
  );
}

function getRoleColor(index: number): string {
  if (index === -1) return Colors.black.primary;
  const colors = [
    Colors.orange.primary,
    Colors.green.primary,
    Colors.blue.primary,
    Colors.violet.primary,
  ];
  return colors[index % colors.length];
}

const refactorDoubleQuotes = (text: string) => {
  return text.replace(/"/g, "'");
};

const isValidInput = (input: string) => {
  // Verifica si el input está vacío
  if (!input.trim()) return false;
  return true;
};

export { UserIcon, getRoleColor, refactorDoubleQuotes, isValidInput };
