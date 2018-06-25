import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe for getting all the keys from an enum.
 */

@Pipe({
  name: 'keys'
})
export class KeysPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let keys = [];

    for( let key in value ) {
      if( !isNaN( parseInt( key ) ) ) {
        keys.push( value[ key ] );
      }
    }

    return keys;
  }

}
