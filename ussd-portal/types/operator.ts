export interface Operator {
  id: number;
  name: string;
  network_id: number;
  country: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOperatorParams {
  name: string;
  network_id: number;
  country: string;
  status?: boolean;
}

export interface UpdateOperatorParams {
  name?: string;
  network_id?: number;
  country?: string;
  status?: boolean;
}
