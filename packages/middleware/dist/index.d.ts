import { RequestHandler } from 'express';
import { AgentAuditConfig } from './types';
export * from './types';
export declare function agentAudit(config: AgentAuditConfig): RequestHandler;
