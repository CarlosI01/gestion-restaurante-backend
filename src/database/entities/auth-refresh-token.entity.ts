import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StaffUser } from './staff-user.entity';

@Entity({ name: 'auth_refresh_token', schema: 'public' })
export class AuthRefreshToken {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @ManyToOne(() => StaffUser) @JoinColumn({ name: 'staff_user_id' }) staffUser: StaffUser;
  @Column({type: "varchar", name: 'token_hash', unique: true, length: 255 }) tokenHash: string;
  @CreateDateColumn({ name: 'issued_at', type: 'timestamp' }) issuedAt: Date;
  @Column({ name: 'expires_at', type: 'timestamp' }) expiresAt: Date;
  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true }) revokedAt: Date | null;
  @Column({type: "varchar", name: 'created_by_ip', length: 64, nullable: true }) createdByIp: string | null;
  @ManyToOne(() => AuthRefreshToken, { nullable: true }) @JoinColumn({ name: 'replaced_by_token_id' }) replacedByToken: AuthRefreshToken | null;
  @Column({type: "varchar", name: 'user_agent', length: 255, nullable: true }) userAgent: string | null;
}
