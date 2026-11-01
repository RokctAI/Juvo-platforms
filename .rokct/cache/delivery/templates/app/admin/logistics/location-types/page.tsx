/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// The kinds of place a driver can file a point of interest as, and what the
// drivers have been typing when none of them fitted.
//
// Two tables, one decision each. The vocabulary above: how many points use a
// type, and whether the type shows on the customer map (absence of that
// decision is a no, so the switch starts off for a type nobody has approved).
// The drivers' own words below: the texts filed under the catch-all type,
// busiest first, and the one action that turns a recurring one into a kind of
// its own - which re-types the points that used it, so the count the answer
// reports is points moved, not rows written.
//
// Every call goes through the server actions beside this page; the roles are
// asserted by map's `api.poi.admin_*` defs, never here. A failed read gets
// its own state rather than an empty table: an admin has to be able to tell
// a vocabulary with nothing in it from a backend that did not answer.

"use client";

import { Loader2, MapPin, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createLocationType,
  listCustomTypes,
  listLocationTypes,
  promoteCustomType,
  setTypeVisibility,
  type AdminCustomType,
  type AdminLocationType,
} from "@/app/actions/delivery/admin/location-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatLastSeen(value: string | null): string {
  if (!value) return "Not recorded";
  const seen = new Date(value.replace(" ", "T"));
  if (Number.isNaN(seen.getTime())) return value;
  return seen.toLocaleString();
}

function pointsFiled(count: number): string {
  return count === 1 ? "1 point" : `${count} points`;
}

export default function LocationTypesPage() {
  const [types, setTypes] = useState<AdminLocationType[]>([]);
  const [customTypes, setCustomTypes] = useState<AdminCustomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [newType, setNewType] = useState("");
  const [newTypeVisible, setNewTypeVisible] = useState(false);
  const [adding, setAdding] = useState(false);

  const [savingType, setSavingType] = useState<string | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [promoteAs, setPromoteAs] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const [typeRows, customRows] = await Promise.all([
        listLocationTypes(),
        listCustomTypes(),
      ]);
      setTypes(typeRows);
      setCustomTypes(customRows);
    } catch (error) {
      console.error("Error fetching location types:", error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVisibility(row: AdminLocationType, visible: boolean) {
    setSavingType(row.name);
    try {
      await setTypeVisibility(row.name, visible);
      setTypes((previous) =>
        previous.map((type) =>
          type.name === row.name
            ? { ...type, customer_visible: visible ? 1 : 0 }
            : type,
        ),
      );
      toast.success(
        visible
          ? `${row.location_type_name} now shows on the customer map`
          : `${row.location_type_name} is hidden from the customer map`,
      );
    } catch (error) {
      toast.error(`Could not change who sees ${row.location_type_name}`);
    } finally {
      setSavingType(null);
    }
  }

  async function handleAdd() {
    const name = newType.trim();
    if (!name) {
      toast.error("Type the kind of place first");
      return;
    }
    setAdding(true);
    try {
      const result: any = await createLocationType(name, newTypeVisible);
      if (result && result.created === false) {
        toast.success(`${name} was already in the vocabulary`);
      } else {
        toast.success(`${name} added`);
      }
      setNewType("");
      setNewTypeVisible(false);
      await load();
    } catch (error) {
      toast.error(`Could not add ${name}`);
    } finally {
      setAdding(false);
    }
  }

  async function handlePromote(row: AdminCustomType) {
    const typed = (promoteAs[row.custom_type] ?? row.custom_type).trim();
    const target = typed === row.custom_type.trim() ? null : typed;
    if (!typed) {
      toast.error("Name the kind of place this becomes");
      return;
    }
    setPromoting(row.custom_type);
    try {
      const result: any = await promoteCustomType(row.custom_type, target, false);
      const renamed = (result && result.location_type) || typed;
      const retyped: number = (result && result.retyped) || 0;
      toast.success(
        `${renamed} is a kind of place now, and ${pointsFiled(retyped)} moved to it`,
      );
      setPromoteAs((previous) => {
        const next = { ...previous };
        delete next[row.custom_type];
        return next;
      });
      await load();
    } catch (error) {
      toast.error(`Could not promote ${row.custom_type}`);
    } finally {
      setPromoting(null);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Location types</h1>
          <p className="text-muted-foreground">
            The kinds of place a driver can file a point of interest as, and
            which of them customers see on the map.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className="mr-2 size-4" />
          Reload
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a type</CardTitle>
          <CardDescription>
            The text is stored as you type it, because the type is named after
            it. Adding one that already exists changes nothing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="location-type-name">Kind of place</Label>
              <Input
                id="location-type-name"
                value={newType}
                onChange={(event) => setNewType(event.target.value)}
                disabled={adding}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="location-type-visible"
                checked={newTypeVisible}
                onCheckedChange={setNewTypeVisible}
                disabled={adding}
              />
              <Label htmlFor="location-type-visible">Shown to customers</Label>
            </div>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              Add type
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">The vocabulary</h2>
          <p className="text-sm text-muted-foreground">
            A seeded type is one the platform ships; it comes back if it is
            deleted.
          </p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kind of place</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Points filed</TableHead>
                <TableHead className="w-[200px]">Shown to customers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="size-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : loadFailed ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <p className="text-muted-foreground">
                      The vocabulary did not load. The tenant site may be
                      unreachable, or this account may not administer it.
                    </p>
                    <Button variant="link" onClick={load}>
                      Try again
                    </Button>
                  </TableCell>
                </TableRow>
              ) : types.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No kinds of place yet. Add the first one above, and drivers
                    can file points against it on their next round.
                  </TableCell>
                </TableRow>
              ) : (
                types.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">
                      <div className="flex flex-wrap items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        {row.location_type_name}
                        {row.is_seeded && <Badge variant="secondary">Seeded</Badge>}
                        {row.takes_custom_type && (
                          <Badge variant="outline">
                            Carries the driver&apos;s own words
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.industry || "None on this site"}
                    </TableCell>
                    <TableCell>{pointsFiled(row.poi_count)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={row.customer_visible === 1}
                          disabled={savingType === row.name}
                          onCheckedChange={(checked) =>
                            handleVisibility(row, checked)
                          }
                        />
                        {savingType === row.name && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Typed by drivers</h2>
          <p className="text-sm text-muted-foreground">
            What drivers wrote when no kind of place fitted, busiest first.
            Promoting one makes it a kind of its own and re-types the points
            filed under it. It starts hidden from customers; the switch above
            is how it is shown.
          </p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>What the driver typed</TableHead>
                <TableHead>Points filed</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead className="w-[340px]">Promote</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="size-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : loadFailed ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    What the drivers typed did not load either. Reload once the
                    tenant site answers again.
                  </TableCell>
                </TableRow>
              ) : customTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nothing to promote: every point on the round was filed as a
                    kind of place that already exists.
                  </TableCell>
                </TableRow>
              ) : (
                customTypes.map((row) => (
                  <TableRow key={row.custom_type}>
                    <TableCell className="font-medium">
                      {row.custom_type}
                    </TableCell>
                    <TableCell>{pointsFiled(row.count)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastSeen(row.last_seen)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          aria-label={`Name the kind of place ${row.custom_type} becomes`}
                          value={promoteAs[row.custom_type] ?? row.custom_type}
                          disabled={promoting === row.custom_type}
                          onChange={(event) =>
                            setPromoteAs((previous) => ({
                              ...previous,
                              [row.custom_type]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="outline"
                          disabled={promoting === row.custom_type}
                          onClick={() => handlePromote(row)}
                        >
                          {promoting === row.custom_type && (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          )}
                          Promote
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
