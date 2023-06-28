import { TFileType } from 'src/media/file.controller';

export type TRole = 'STUDENT' | 'TUTOR' | 'ADMIN';
interface IFileKey {
  mediaType: TFileType;
  id: number;
  first_name: string;
  role: TRole;
  fileName: string;
}

const FileKey = (data: IFileKey) => {
  const { mediaType, id, first_name, role, fileName } = data;
  if (role === 'ADMIN') {
    return `${role}/${mediaType}/` + `${Date.now().toString()}_${fileName}`;
  } else {
    return `${role}/${id}_${first_name}/${mediaType}/` + `${Date.now().toString()}_${fileName}`;
  }
};
export { FileKey };
