import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { STRAPI_CONFIG } from './constants';
import type {
  TimelineStage,
  TimelinePerson,
  TimelineMetric,
  TimelineDocument,
  ApiResponse,
  StrapiMedia,
} from './types';

/**
 * Strapi API Client
 * Handles all communication with the Strapi CMS backend
 */
class StrapiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: STRAPI_CONFIG.url,
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_CONFIG.apiToken && {
          Authorization: `Bearer ${STRAPI_CONFIG.apiToken}`,
        }),
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Strapi API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request
   */
  private async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  private async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  private async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  private async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  // ============================================
  // TIMELINE STAGES
  // ============================================

  /**
   * Get all timeline stages
   */
  async getStages(params?: {
    populate?: string[];
    filters?: Record<string, any>;
    sort?: string[];
    pagination?: { page?: number; pageSize?: number };
  }): Promise<ApiResponse<TimelineStage[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.get<ApiResponse<TimelineStage[]>>(`/api/timeline-stages?${queryParams}`);
  }

  /**
   * Get a single stage by ID or slug
   */
  async getStageById(id: string, populate?: string[]): Promise<ApiResponse<TimelineStage>> {
    const populateQuery = populate ? `?populate=${populate.join(',')}` : '?populate=*';
    return this.get<ApiResponse<TimelineStage>>(`/api/timeline-stages/${id}${populateQuery}`);
  }

  /**
   * Get stage by stage_id (slug)
   */
  async getStageBySlug(slug: string): Promise<TimelineStage | null> {
    const response = await this.getStages({
      filters: { stage_id: { $eq: slug } },
      populate: ['featured_image', 'gallery_images', 'documents', 'people', 'metrics'],
    });

    return response.data[0] || null;
  }

  /**
   * Create a new stage (admin only)
   */
  async createStage(data: Partial<TimelineStage>): Promise<ApiResponse<TimelineStage>> {
    return this.post<ApiResponse<TimelineStage>>('/api/timeline-stages', { data });
  }

  /**
   * Update a stage (admin only)
   */
  async updateStage(id: number, data: Partial<TimelineStage>): Promise<ApiResponse<TimelineStage>> {
    return this.put<ApiResponse<TimelineStage>>(`/api/timeline-stages/${id}`, { data });
  }

  // ============================================
  // GALLERY & MEDIA
  // ============================================

  /**
   * Get gallery images for a stage
   */
  async getStageGallery(stageId: string): Promise<StrapiMedia[]> {
    const stage = await this.getStageBySlug(stageId);
    return stage?.gallery_images || [];
  }

  /**
   * Upload a file to Strapi
   */
  async uploadFile(file: File, refId?: number, ref?: string, field?: string): Promise<StrapiMedia[]> {
    const formData = new FormData();
    formData.append('files', file);

    if (refId) formData.append('refId', refId.toString());
    if (ref) formData.append('ref', ref);
    if (field) formData.append('field', field);

    return this.post<StrapiMedia[]>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Add image to stage gallery
   */
  async addToGallery(stageId: number, fileId: number): Promise<ApiResponse<TimelineStage>> {
    const stage = await this.getStageById(stageId.toString());
    const currentGallery = stage.data.gallery_images?.map((img: any) => img.id) || [];

    return this.updateStage(stageId, {
      gallery_images: [...currentGallery, fileId] as any,
    });
  }

  // ============================================
  // DOCUMENTS
  // ============================================

  /**
   * Get documents for a stage
   */
  async getStageDocuments(stageId: string): Promise<TimelineDocument[]> {
    const response = await this.get<ApiResponse<TimelineDocument[]>>(
      `/api/timeline-documents?filters[stage][stage_id][$eq]=${stageId}&populate=*`
    );
    return response.data;
  }

  /**
   * Create a new document
   */
  async createDocument(data: Partial<TimelineDocument>): Promise<ApiResponse<TimelineDocument>> {
    return this.post<ApiResponse<TimelineDocument>>('/api/timeline-documents', { data });
  }

  // ============================================
  // PEOPLE
  // ============================================

  /**
   * Get people involved in a stage
   */
  async getStagePeople(stageId: string): Promise<TimelinePerson[]> {
    const response = await this.get<ApiResponse<TimelinePerson[]>>(
      `/api/timeline-people?filters[stages_involved][stage_id][$eq]=${stageId}&populate=*`
    );
    return response.data;
  }

  /**
   * Get all people
   */
  async getPeople(populate?: string[]): Promise<ApiResponse<TimelinePerson[]>> {
    const populateQuery = populate ? `?populate=${populate.join(',')}` : '?populate=*';
    return this.get<ApiResponse<TimelinePerson[]>>(`/api/timeline-people${populateQuery}`);
  }

  /**
   * Create a new person
   */
  async createPerson(data: Partial<TimelinePerson>): Promise<ApiResponse<TimelinePerson>> {
    return this.post<ApiResponse<TimelinePerson>>('/api/timeline-people', { data });
  }

  // ============================================
  // METRICS
  // ============================================

  /**
   * Get metrics for a stage
   */
  async getStageMetrics(stageId: string): Promise<TimelineMetric[]> {
    const response = await this.get<ApiResponse<TimelineMetric[]>>(
      `/api/timeline-metrics?filters[stage][stage_id][$eq]=${stageId}&populate=*`
    );
    return response.data;
  }

  /**
   * Create a new metric
   */
  async createMetric(data: Partial<TimelineMetric>): Promise<ApiResponse<TimelineMetric>> {
    return this.post<ApiResponse<TimelineMetric>>('/api/timeline-metrics', { data });
  }

  // ============================================
  // SEARCH
  // ============================================

  /**
   * Full-text search across content types
   */
  async search(query: string, contentTypes?: string[]): Promise<any> {
    // This would require a custom Strapi search endpoint or use of a plugin
    // For now, implement basic filtering
    const types = contentTypes || ['timeline-stages', 'timeline-documents', 'timeline-people'];
    const results = await Promise.all(
      types.map((type) =>
        this.get<ApiResponse<any[]>>(`/api/${type}?filters[$or][0][title][$containsi]=${query}&filters[$or][1][description][$containsi]=${query}`)
      )
    );

    return results.flatMap((r, i) =>
      r.data.map((item) => ({
        type: types[i],
        ...item,
      }))
    );
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Build query parameters for Strapi REST API
   */
  private buildQueryParams(params?: {
    populate?: string[];
    filters?: Record<string, any>;
    sort?: string[];
    pagination?: { page?: number; pageSize?: number };
  }): string {
    if (!params) return 'populate=*';

    const queryParts: string[] = [];

    // Populate
    if (params.populate && params.populate.length > 0) {
      queryParts.push(`populate=${params.populate.join(',')}`);
    } else {
      queryParts.push('populate=*');
    }

    // Filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        queryParts.push(`filters[${key}]=${JSON.stringify(value)}`);
      });
    }

    // Sort
    if (params.sort && params.sort.length > 0) {
      params.sort.forEach((sortItem) => {
        queryParts.push(`sort=${sortItem}`);
      });
    }

    // Pagination
    if (params.pagination) {
      if (params.pagination.page) {
        queryParts.push(`pagination[page]=${params.pagination.page}`);
      }
      if (params.pagination.pageSize) {
        queryParts.push(`pagination[pageSize]=${params.pagination.pageSize}`);
      }
    }

    return queryParts.join('&');
  }

  /**
   * Get full media URL
   */
  getMediaUrl(media: StrapiMedia | string): string {
    if (typeof media === 'string') {
      return media.startsWith('http') ? media : `${STRAPI_CONFIG.url}${media}`;
    }
    return media.url.startsWith('http') ? media.url : `${STRAPI_CONFIG.url}${media.url}`;
  }
}

// Export singleton instance
export const strapiClient = new StrapiClient();
export default strapiClient;
