export type Institution = { id: string; name: string; logo: string };
export class CreateConnectionDto {
    institutionId!: string;
}