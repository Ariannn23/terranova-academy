export interface SchoolConfig {
  nombre: string;
  director: string;
  direccion: string;
  telefono: string;
  correo: string;
  ugel: string;
  notaMinima: string;
  maxFaltas: string;
}

export interface ConfigHandlers {
  handleChange: (field: keyof SchoolConfig, value: string) => void;
  handleSave: () => void;
}
