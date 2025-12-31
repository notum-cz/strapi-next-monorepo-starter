'use client';

import Image from 'next/image';
import { Mail, MapPin, ExternalLink, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import { strapiClient } from '@/lib/strapi-client';
import type { PeoplePanelProps } from '@/lib/types';

export default function PeoplePanel({ people, stage_id }: PeoplePanelProps) {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">👥</span>
        </div>
        <p className="text-gray-500">No people documented for this stage yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          People & Partners
        </h3>
        <p className="text-sm text-gray-600">
          Meet the amazing humans who made this stage possible
        </p>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {people.map((person) => (
          <div
            key={person.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {person.avatar ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={strapiClient.getMediaUrl(person.avatar)}
                      alt={person.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-nwk-green text-white flex items-center justify-center text-xl font-bold">
                    {person.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">{person.name}</h4>
                <p className="text-sm text-nwk-green font-medium mb-2">{person.role}</p>

                {/* Location */}
                {person.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{person.location}</span>
                  </div>
                )}

                {/* Bio */}
                {person.bio && (
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {person.bio}
                  </p>
                )}

                {/* Contact & Social */}
                <div className="flex flex-wrap items-center gap-2">
                  {person.email && (
                    <a
                      href={`mailto:${person.email}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                      title="Send email"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>
                  )}

                  {person.website && (
                    <a
                      href={person.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                      title="Visit website"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Website</span>
                    </a>
                  )}

                  {/* Social Links */}
                  {person.social_links && (
                    <>
                      {Object.entries(person.social_links).map(([platform, url]) => {
                        if (!url) return null;
                        return (
                          <a
                            key={platform}
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title={platform}
                          >
                            {getSocialIcon(platform)}
                          </a>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-nwk-light rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{people.length} people</span> contributed to this stage.
          {people.some(p => p.role.toLowerCase().includes('volunteer')) && (
            <> We deeply appreciate all volunteers who made this work possible.</>
          )}
        </p>
      </div>
    </div>
  );
}
